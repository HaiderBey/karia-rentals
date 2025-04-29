import express from "express"
import Payment from "../models/Payment.js"
import Reservation from "../models/Reservation.js"
import { authenticateUser, authorizeAdmin } from "../middleware/auth.js"
import { generateInvoice } from "../utils/invoiceGenerator.js"

const router = express.Router()

// Process payment
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { reservationId, amount, method, transactionId } = req.body

    // Validate required fields
    if (!reservationId || !amount || !method) {
      return res.status(400).json({ message: "Reservation ID, amount, and payment method are required" })
    }

    // Check if reservation exists
    const reservation = await Reservation.findById(reservationId)
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    // Check if user is authorized to make payment for this reservation
    if (reservation.customer.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to make payment for this reservation" })
    }

    // Create payment
    const payment = new Payment({
      reservation: reservationId,
      customer: req.user.id,
      amount,
      method,
      status: "completed",
      transactionId: transactionId || `TXN-${Date.now()}`,
    })

    const savedPayment = await payment.save()

    // Update reservation payment status
    const totalPaid = await Payment.aggregate([
      { $match: { reservation: reservation._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0

    if (paidAmount >= reservation.totalPrice) {
      reservation.paymentStatus = "paid"
    } else if (paidAmount > 0) {
      reservation.paymentStatus = "partial"
    }

    await reservation.save()

    // Generate invoice
    const invoiceUrl = await generateInvoice(savedPayment)

    // Update payment with invoice information
    savedPayment.invoiceGenerated = true
    await savedPayment.save()

    res.status(201).json({
      payment: savedPayment,
      invoiceUrl,
      message: "Payment processed successfully",
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get all payments (admin only)
router.get("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("reservation")
      .populate("customer", "-password")
      .sort({ paymentDate: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get payment by ID
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("reservation").populate("customer", "-password")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Check if user is authorized to view this payment
    if (payment.customer._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this payment" })
    }

    res.json(payment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get payments by reservation
router.get("/reservation/:reservationId", authenticateUser, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId)

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    // Check if user is authorized to view payments for this reservation
    if (reservation.customer.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view payments for this reservation" })
    }

    const payments = await Payment.find({ reservation: req.params.reservationId }).sort({ paymentDate: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get payments by customer
router.get("/customer/history", authenticateUser, async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user.id }).populate("reservation").sort({ paymentDate: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Process refund (admin only)
router.post("/:id/refund", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const { amount, reason } = req.body

    const payment = await Payment.findById(req.params.id)
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    if (payment.status === "refunded") {
      return res.status(400).json({ message: "Payment has already been refunded" })
    }

    // Create refund payment
    const refund = new Payment({
      reservation: payment.reservation,
      customer: payment.customer,
      amount: -(amount || payment.amount),
      method: payment.method,
      status: "refunded",
      transactionId: `REF-${payment.transactionId || payment._id}`,
    })

    const savedRefund = await refund.save()

    // Update original payment status
    payment.status = "refunded"
    await payment.save()

    // Update reservation payment status
    const reservation = await Reservation.findById(payment.reservation)
    if (reservation) {
      const totalPaid = await Payment.aggregate([
        { $match: { reservation: reservation._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])

      const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0

      if (paidAmount <= 0) {
        reservation.paymentStatus = "pending"
      } else if (paidAmount < reservation.totalPrice) {
        reservation.paymentStatus = "partial"
      }

      await reservation.save()
    }

    res.json({
      refund: savedRefund,
      message: "Refund processed successfully",
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Generate invoice for payment
router.get("/:id/invoice", authenticateUser, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("reservation").populate("customer", "-password")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Check if user is authorized to view this payment
    if (payment.customer._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this payment" })
    }

    // Generate invoice
    const invoiceUrl = await generateInvoice(payment)

    // Update payment with invoice information
    payment.invoiceGenerated = true
    await payment.save()

    res.json({
      invoiceUrl,
      message: "Invoice generated successfully",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
