import mongoose from "mongoose"

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    type: {
      type: String,
      enum: ["routine", "repair", "inspection"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedDate: Date,
    cost: Number,
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: String,
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
maintenanceSchema.index({ vehicle: 1 })
maintenanceSchema.index({ status: 1 })
maintenanceSchema.index({ scheduledDate: 1 })

export default mongoose.model("Maintenance", maintenanceSchema)
