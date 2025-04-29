import express from "express"
import Vehicle from "../models/Vehicle.js"
import Reservation from "../models/Reservation.js" // Import Reservation model
import { authenticateUser, authorizeAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all vehicles with optional filtering
router.get("/", async (req, res) => {
  try {
    const { brand, category, status, minPrice, maxPrice } = req.query

    // Build filter object
    const filter = {}
    if (brand) filter.brand = brand
    if (category) filter.category = category
    if (status) filter.status = status

    // Price range filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {}
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice)
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice)
    }

    const vehicles = await Vehicle.find(filter)
    res.json(vehicles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }
    res.json(vehicle)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new vehicle (admin only)
router.post("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body)
    const savedVehicle = await vehicle.save()
    res.status(201).json(savedVehicle)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update vehicle (admin only)
router.put("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    res.json(updatedVehicle)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete vehicle (admin only)
router.delete("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id)

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    res.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Check vehicle availability for a specific date range
router.get("/check-availability/:id", async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" })
    }

    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    // Check if vehicle is available (not in maintenance or already rented)
    if (vehicle.status !== "available") {
      return res.json({ available: false, reason: `Vehicle is currently ${vehicle.status}` })
    }

    // Check if there are any overlapping reservations
    const overlappingReservations = await Reservation.find({
      vehicle: req.params.id,
      status: { $in: ["pending", "confirmed", "active"] },
      $or: [{ pickupDate: { $lte: new Date(endDate) }, dropoffDate: { $gte: new Date(startDate) } }],
    })

    res.json({
      available: overlappingReservations.length === 0,
      reason: overlappingReservations.length > 0 ? "Vehicle is already reserved for this period" : null,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update vehicle status
router.patch("/:id/status", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body

    if (!status || !["available", "rented", "maintenance"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" })
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { status }, { new: true })

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    res.json(vehicle)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
