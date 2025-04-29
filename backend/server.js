import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import vehicleRoutes from "./routes/vehicleRoutes.js"
import reservationRoutes from "./routes/reservationRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import maintenanceRoutes from "./routes/maintenanceRoutes.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/maintenance", maintenanceRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("Karia Car Rental API is running")
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
