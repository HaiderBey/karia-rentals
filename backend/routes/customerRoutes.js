import express from "express"
import Customer from "../models/Customer.js"
import Reservation from "../models/Reservation.js"
import jwt from "jsonwebtoken"
import { authenticateUser, authorizeAdmin } from "../middleware/auth.js"

const router = express.Router()

// Register new customer
router.post("/register", async (req, res) => {
  try {
    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: req.body.email })
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already in use" })
    }

    const customer = new Customer(req.body)
    const savedCustomer = await customer.save()

    // Generate JWT token
    const token = jwt.sign({ id: savedCustomer._id, email: savedCustomer.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    })

    res.status(201).json({
      message: "Customer registered successfully",
      token,
      customer: {
        id: savedCustomer._id,
        firstName: savedCustomer.firstName,
        lastName: savedCustomer.lastName,
        email: savedCustomer.email,
      },
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Login customer
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find customer by email
    const customer = await Customer.findOne({ email })
    if (!customer) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Verify password
    const isPasswordValid = await customer.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: customer._id, email: customer.email }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.json({
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get customer profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-password")
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update customer profile
router.put("/profile", authenticateUser, async (req, res) => {
  try {
    // Don't allow password update through this route
    if (req.body.password) {
      delete req.body.password
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json(updatedCustomer)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Change password
router.post("/change-password", authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Find customer
    const customer = await Customer.findById(req.user.id)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Verify current password
    const isPasswordValid = await customer.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Update password
    customer.password = newPassword
    await customer.save()

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Upload driving license
router.post("/upload-license", authenticateUser, async (req, res) => {
  try {
    const { number, expiryDate, image } = req.body

    if (!number || !expiryDate || !image) {
      return res.status(400).json({ message: "License number, expiry date, and image are required" })
    }

    const customer = await Customer.findByIdAndUpdate(
      req.user.id,
      {
        "drivingLicense.number": number,
        "drivingLicense.expiryDate": expiryDate,
        "drivingLicense.image": image,
        "drivingLicense.verified": false,
      },
      { new: true },
    ).select("-password")

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json({
      message: "Driving license uploaded successfully. It will be verified soon.",
      customer,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Upload identity document
router.post("/upload-identity", authenticateUser, async (req, res) => {
  try {
    const { type, number, image } = req.body

    if (!type || !number || !image) {
      return res.status(400).json({ message: "Document type, number, and image are required" })
    }

    const customer = await Customer.findByIdAndUpdate(
      req.user.id,
      {
        "identityDocument.type": type,
        "identityDocument.number": number,
        "identityDocument.image": image,
        "identityDocument.verified": false,
      },
      { new: true },
    ).select("-password")

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json({
      message: "Identity document uploaded successfully. It will be verified soon.",
      customer,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get customer rental history
router.get("/rental-history", authenticateUser, async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user.id }).populate("vehicle").sort({ createdAt: -1 })

    res.json(reservations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Verify customer documents (admin only)
router.patch("/:id/verify-documents", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { drivingLicense, identityDocument } = req.body

    const updateData = {}
    if (drivingLicense !== undefined) {
      updateData["drivingLicense.verified"] = drivingLicense
    }
    if (identityDocument !== undefined) {
      updateData["identityDocument.verified"] = identityDocument
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password")

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json({
      message: "Customer documents verification status updated",
      customer,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get all customers (admin only)
router.get("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().select("-password")
    res.json(customers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get customer by ID (admin only)
router.get("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password")
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }
    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
