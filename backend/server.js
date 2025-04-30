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

// CORS configuration - Allow requests from any origin during development
const corsOptions = {
  origin: "*", // In production, replace with your specific domain
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.headers);
  next();
});

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