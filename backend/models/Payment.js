import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer", "cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      sparse: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    invoiceGenerated: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Auto-generate invoice number before saving
paymentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    // Find the last invoice number for this month
    const lastPayment = await this.constructor
      .findOne({
        invoiceNumber: { $regex: `INV-${year}${month}-` },
      })
      .sort({ invoiceNumber: -1 })

    let sequence = 1
    if (lastPayment && lastPayment.invoiceNumber) {
      const lastSequence = Number.parseInt(lastPayment.invoiceNumber.split("-")[2])
      sequence = lastSequence + 1
    }

    this.invoiceNumber = `INV-${year}${month}-${sequence.toString().padStart(4, "0")}`
  }
  next()
})

// Index for faster queries
paymentSchema.index({ reservation: 1 })
paymentSchema.index({ customer: 1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ invoiceNumber: 1 })

export default mongoose.model("Payment", paymentSchema)
