import express from "express"
import Reservation from "../models/Reservation.js"
import Vehicle from "../models/Vehicle.js"
import { authenticateUser, authorizeAdmin } from "../middleware/auth.js"
import { calculateReservationPrice } from "../utils/priceCalculator.js"

const router = express.Router()

// Create new reservation
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { vehicleId, pickupLocation, dropoffLocation, pickupDate, dropoffDate, additionalOptions } = req.body

    // Validate required fields
    if (!vehicleId || !pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if dates are valid
    const pickup = new Date(pickupDate)
    const dropoff = new Date(dropoffDate)

    if (pickup >= dropoff) {
      return res.status(400).json({ message: "Pickup date must be before dropoff date" })
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    if (vehicle.status !== "available") {
      return res.status(400).json({ message: `Vehicle is currently ${vehicle.status}` })
    }

    // Check if there are any overlapping reservations
    const overlappingReservations = await Reservation.find({
      vehicle: vehicleId,
      status: { $in: ["pending", "confirmed", "active"] },
      $or: [{ pickupDate: { $lte: dropoff }, dropoffDate: { $gte: pickup } }],
    })

    if (overlappingReservations.length > 0) {
      return res.status(400).json({ message: "Vehicle is already reserved for this period" })
    }

    // Calculate total price
    const totalPrice = calculateReservationPrice(vehicle, pickup, dropoff, additionalOptions)

    // Create reservation
    const reservation = new Reservation({
      customer: req.user.id,
      vehicle: vehicleId,
      pickupLocation,
      dropoffLocation,
      pickupDate: pickup,
      dropoffDate: dropoff,
      totalPrice,
      additionalOptions: additionalOptions || [],
      status: "pending",
    })

    const savedReservation = await reservation.save()

    // Populate vehicle and customer details
    await savedReservation.populate("vehicle")
    await savedReservation.populate("customer", "-password")

    res.status(201).json(savedReservation)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get all reservations (admin only)
router.get("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query

    // Build filter object
    const filter = {}
    if (status) filter.status = status

    // Date range filter
    if (startDate || endDate) {
      filter.$or = []

      if (startDate && endDate) {
        filter.$or.push({
          pickupDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        })
        filter.$or.push({
          dropoffDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        })
      } else if (startDate) {
        filter.$or.push({ pickupDate: { $gte: new Date(startDate) } })
        filter.$or.push({ dropoffDate: { $gte: new Date(startDate) } })
      } else if (endDate) {
        filter.$or.push({ pickupDate: { $lte: new Date(endDate) } })
        filter.$or.push({ dropoffDate: { $lte: new Date(endDate) } })
      }
    }

    const reservations = await Reservation.find(filter)
      .populate("vehicle")
      .populate("customer", "-password")
      .sort({ createdAt: -1 })

    res.json(reservations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get reservation by ID
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("vehicle").populate("customer", "-password")

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    // Check if user is authorized to view this reservation
    if (reservation.customer._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this reservation" })
    }

    res.json(reservation)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update reservation status (admin only)
router.patch("/:id/status", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body

    if (!status || !["pending", "confirmed", "active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" })
    }

    const reservation = await Reservation.findById(req.params.id)
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    // Update vehicle status based on reservation status
    if (status === "confirmed" || status === "active") {
      await Vehicle.findByIdAndUpdate(reservation.vehicle, { status: "rented" })
    } else if (status === "completed" || status === "cancelled") {
      await Vehicle.findByIdAndUpdate(reservation.vehicle, { status: "available" })
    }

    // Update reservation status
    reservation.status = status
    const updatedReservation = await reservation.save()

    // Populate vehicle and customer details
    await updatedReservation.populate("vehicle")
    await updatedReservation.populate("customer", "-password")

    res.json(updatedReservation)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Cancel reservation
router.patch("/:id/cancel", authenticateUser, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    // Check if user is authorized to cancel this reservation
    if (reservation.customer.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to cancel this reservation" })
    }

    // Check if reservation can be cancelled
    if (["completed", "cancelled"].includes(reservation.status)) {
      return res.status(400).json({ message: `Reservation is already ${reservation.status}` })
    }

    // Update vehicle status
    await Vehicle.findByIdAndUpdate(reservation.vehicle, { status: "available" })

    // Update reservation status
    reservation.status = "cancelled"
    const updatedReservation = await reservation.save()

    // Populate vehicle and customer details
    await updatedReservation.populate("vehicle")
    await updatedReservation.populate("customer", "-password")

    res.json(updatedReservation)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Modify reservation
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    // Check if user is authorized to modify this reservation
    if (reservation.customer.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to modify this reservation" })
    }

    // Check if reservation can be modified
    if (["active", "completed", "cancelled"].includes(reservation.status)) {
      return res.status(400).json({ message: `Cannot modify a reservation that is ${reservation.status}` })
    }

    const { pickupLocation, dropoffLocation, pickupDate, dropoffDate, additionalOptions } = req.body

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if dates are valid
    const pickup = new Date(pickupDate)
    const dropoff = new Date(dropoffDate)

    if (pickup >= dropoff) {
      return res.status(400).json({ message: "Pickup date must be before dropoff date" })
    }

    // Check if there are any overlapping reservations (excluding this one)
    const overlappingReservations = await Reservation.find({
      _id: { $ne: req.params.id },
      vehicle: reservation.vehicle,
      status: { $in: ["pending", "confirmed", "active"] },
      $or: [{ pickupDate: { $lte: dropoff }, dropoffDate: { $gte: pickup } }],
    })

    if (overlappingReservations.length > 0) {
      return res.status(400).json({ message: "Vehicle is already reserved for this period" })
    }

    // Get vehicle details for price calculation
    const vehicle = await Vehicle.findById(reservation.vehicle)

    // Calculate total price
    const totalPrice = calculateReservationPrice(vehicle, pickup, dropoff, additionalOptions)

    // Update reservation
    reservation.pickupLocation = pickupLocation
    reservation.dropoffLocation = dropoffLocation
    reservation.pickupDate = pickup
    reservation.dropoffDate = dropoff
    reservation.totalPrice = totalPrice
    reservation.additionalOptions = additionalOptions || []

    const updatedReservation = await reservation.save()

    // Populate vehicle and customer details
    await updatedReservation.populate("vehicle")
    await updatedReservation.populate("customer", "-password")

    res.json(updatedReservation)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
