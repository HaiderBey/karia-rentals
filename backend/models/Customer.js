import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    drivingLicense: {
      number: {
        type: String,
        required: true,
        trim: true,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      image: String,
    },
    identityDocument: {
      type: {
        type: String,
        enum: ["passport", "id_card", "other"],
        required: true,
      },
      number: {
        type: String,
        required: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      image: String,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
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

// Hash password before saving
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
customerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Index for faster queries
customerSchema.index({ email: 1 })
customerSchema.index({ "drivingLicense.number": 1 })

export default mongoose.model("Customer", customerSchema)
