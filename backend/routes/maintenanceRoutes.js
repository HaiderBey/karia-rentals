import express from "express"
import Maintenance from "../models/Maintenance.js"
import Vehicle from "../models/Vehicle.js"
import { authenticateUser, authorizeAdmin } from "../middleware/auth.js"

const router = express.Router()

// Schedule maintenance (admin only)
router.post("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { vehicleId, type, description, scheduledDate, cost } = req.body

    // Validate required fields
    if (!vehicleId || !type || !description || !scheduledDate) {
      return res.status(400).json({ message: "Vehicle ID, type, description, and scheduled date are required" })
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" })
    }

    // Create maintenance record
    const maintenance = new Maintenance({
      vehicle: vehicleId,
      type,
      description,
      scheduledDate: new Date(scheduledDate),
      cost: cost || 0,
      status: "scheduled",
    })

    const savedMaintenance = await maintenance.save()

    // Update vehicle's next maintenance date
    vehicle.nextMaintenance = new Date(scheduledDate)
    await vehicle.save()

    res.status(201).json(savedMaintenance)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get all maintenance records (admin only)
router.get("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { status, vehicleId, startDate, endDate } = req.query

    // Build filter object
    const filter = {}
    if (status) filter.status = status
    if (vehicleId) filter.vehicle = vehicleId

    // Date range filter
    if (startDate || endDate) {
      filter.scheduledDate = {}
      if (startDate) filter.scheduledDate.$gte = new Date(startDate)
      if (endDate) filter.scheduledDate.$lte = new Date(endDate)
    }

    const maintenanceRecords = await Maintenance.find(filter).populate("vehicle").sort({ scheduledDate: 1 })

    res.json(maintenanceRecords)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get maintenance record by ID (admin only)
router.get("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id).populate("vehicle")

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" })
    }

    res.json(maintenance)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update maintenance status (admin only)
router.patch("/:id/status", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { status, completedDate, cost, notes } = req.body

    if (!status || !["scheduled", "in_progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" })
    }

    const maintenance = await Maintenance.findById(req.params.id)
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" })
    }

    // Update maintenance record
    maintenance.status = status

    if (status === "completed") {
      maintenance.completedDate = completedDate ? new Date(completedDate) : new Date()

      // Update vehicle's last maintenance date and status
      await Vehicle.findByIdAndUpdate(maintenance.vehicle, {
        lastMaintenance: maintenance.completedDate,
        status: "available",
      })
    } else if (status === "in_progress") {
      // Update vehicle status to maintenance
      await Vehicle.findByIdAndUpdate(maintenance.vehicle, {
        status: "maintenance",
      })
    } else if (status === "cancelled") {
      // Update vehicle status to available if it was in maintenance
      const vehicle = await Vehicle.findById(maintenance.vehicle)
      if (vehicle && vehicle.status === "maintenance") {
        vehicle.status = "available"
        await vehicle.save()
      }
    }

    if (cost !== undefined) {
      maintenance.cost = cost
    }

    if (notes) {
      maintenance.notes = notes
    }

    const updatedMaintenance = await maintenance.save()
    await updatedMaintenance.populate("vehicle")

    res.json(updatedMaintenance)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update maintenance details (admin only)
router.put("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { type, description, scheduledDate, cost, notes } = req.body

    const maintenance = await Maintenance.findById(req.params.id)
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" })
    }

    // Don't allow updating completed or cancelled maintenance
    if (["completed", "cancelled"].includes(maintenance.status)) {
      return res.status(400).json({ message: `Cannot update a ${maintenance.status} maintenance record` })
    }

    // Update fields
    if (type) maintenance.type = type
    if (description) maintenance.description = description
    if (scheduledDate) {
      maintenance.scheduledDate = new Date(scheduledDate)

      // Update vehicle's next maintenance date
      await Vehicle.findByIdAndUpdate(maintenance.vehicle, {
        nextMaintenance: maintenance.scheduledDate,
      })
    }
    if (cost !== undefined) maintenance.cost = cost
    if (notes) maintenance.notes = notes

    const updatedMaintenance = await maintenance.save()
    await updatedMaintenance.populate("vehicle")

    res.json(updatedMaintenance)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete maintenance record (admin only)
router.delete("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" })
    }

    // Don't allow deleting in-progress maintenance
    if (maintenance.status === "in_progress") {
      return res.status(400).json({ message: "Cannot delete an in-progress maintenance record" })
    }

    await Maintenance.findByIdAndDelete(req.params.id)

    res.json({ message: "Maintenance record deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get maintenance records by vehicle
router.get("/vehicle/:vehicleId", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const maintenanceRecords = await Maintenance.find({ vehicle: req.params.vehicleId }).sort({ scheduledDate: -1 })

    res.json(maintenanceRecords)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
