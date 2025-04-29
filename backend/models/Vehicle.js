import mongoose from "mongoose"

const vehicleSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "rented", "maintenance"],
      default: "available",
    },
    category: {
      type: String,
      enum: ["sedan", "suv", "compact", "luxury", "truck", "wagon", "hatchback", "sports", "offroad"],
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    transmission: {
      type: String,
      enum: ["automatic", "manual"],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    fuel: {
      type: String,
      enum: ["gasoline", "diesel", "electric", "hybrid"],
      required: true,
    },
    features: [String],
    images: [String],
    lastMaintenance: {
      type: Date,
      default: Date.now,
    },
    nextMaintenance: {
      type: Date,
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

// Index for faster queries
vehicleSchema.index({ brand: 1, model: 1 })
vehicleSchema.index({ status: 1 })
vehicleSchema.index({ category: 1 })

export default mongoose.model("Vehicle", vehicleSchema)
