import jwt from "jsonwebtoken"
import Customer from "../models/Customer.js"

// Authenticate user middleware
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    const customer = await Customer.findById(decoded.id).select("-password")

    if (!customer) {
      return res.status(401).json({ message: "Invalid token" })
    }

    // Add user to request
    req.user = customer
    next()
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" })
  }
}

// Authorize admin middleware
export const authorizeAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}
