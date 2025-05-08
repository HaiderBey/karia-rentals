// Import API configuration and storage keys
import { API_CONFIG } from "./config.js"
import { STORAGE_KEYS } from "./config.js"

// API Service
class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
    this.endpoints = API_CONFIG.ENDPOINTS
  }

  // Helper method to get auth token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  // Helper method to build headers
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    }

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    return headers
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Une erreur est survenue")
    }

    return data
  }

  // Generic request method
  async request(endpoint, method = "GET", data = null, includeAuth = true) {
    const url = `${this.baseUrl}${endpoint}`
    const options = {
      method,
      headers: this.getHeaders(includeAuth),
    }

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      return await this.handleResponse(response)
    } catch (error) {
      console.error("API request error:", error)
      throw error
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request(this.endpoints.REGISTER, "POST", userData, false)
  }

  async login(credentials) {
    return this.request(this.endpoints.LOGIN, "POST", credentials, false)
  }

  async getProfile() {
    return this.request(this.endpoints.PROFILE)
  }

  async updateProfile(profileData) {
    return this.request(this.endpoints.PROFILE, "PUT", profileData)
  }

  async changePassword(passwordData) {
    return this.request(this.endpoints.CHANGE_PASSWORD, "POST", passwordData)
  }

  async uploadLicense(licenseData) {
    return this.request(this.endpoints.UPLOAD_LICENSE, "POST", licenseData)
  }

  async uploadIdentity(identityData) {
    return this.request(this.endpoints.UPLOAD_IDENTITY, "POST", identityData)
  }

  async getRentalHistory() {
    return this.request(this.endpoints.RENTAL_HISTORY)
  }

  // Vehicle methods
  async getVehicles(filters = {}) {
    const queryParams = new URLSearchParams()

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString()
    const endpoint = queryString ? `${this.endpoints.VEHICLES}?${queryString}` : this.endpoints.VEHICLES

    return this.request(endpoint, "GET", null, false)
  }

  async getVehicleById(id) {
    return this.request(`${this.endpoints.VEHICLES}/${id}`, "GET", null, false)
  }

  async checkVehicleAvailability(id, startDate, endDate) {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    })

    return this.request(`${this.endpoints.VEHICLE_AVAILABILITY}/${id}?${queryParams}`, "GET", null, false)
  }

  // Create a reservation
  async createReservation(reservationData) {
    try {
      // For demo purposes, simulate API call
      console.log("Creating reservation with data:", reservationData)

      // Simulate successful response
      const response = {
        _id: `res_${Date.now()}`,
        customer: this.getCustomerId(),
        vehicle: reservationData.vehicleId,
        pickupLocation: reservationData.pickupLocation,
        dropoffLocation: reservationData.dropoffLocation,
        pickupDate: reservationData.pickupDate,
        dropoffDate: reservationData.dropoffDate,
        status: "pending",
        totalPrice: this.calculateTotalPrice(reservationData),
        additionalOptions: reservationData.additionalOptions || [],
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
      }

      // In a real app, this would be an API call:
      // return this.request(this.endpoints.RESERVATIONS, "POST", reservationData);

      return response
    } catch (error) {
      console.error("Create reservation error:", error)
      throw error
    }
  }

  // Process payment
  async processPayment(paymentData) {
    try {
      // For demo purposes, simulate API call
      console.log("Processing payment with data:", paymentData)

      // Simulate successful response
      const response = {
        _id: `pay_${Date.now()}`,
        reservation: paymentData.reservationId,
        customer: this.getCustomerId(),
        amount: paymentData.amount,
        method: paymentData.method,
        status: "completed",
        transactionId: paymentData.transactionId || `TXN-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(5, "0")}`,
        invoiceGenerated: true,
      }

      // In a real app, this would be an API call:
      // return this.request(this.endpoints.PAYMENTS, "POST", paymentData);

      return response
    } catch (error) {
      console.error("Process payment error:", error)
      throw error
    }
  }

  // Helper method to get customer ID
  getCustomerId() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER)
    if (userData) {
      const user = JSON.parse(userData)
      return user.id || "customer_id"
    }
    return "customer_id"
  }

  // Helper method to calculate total price
  calculateTotalPrice(reservationData) {
    // Get vehicle price
    const vehicle = this.getVehicleById(reservationData.vehicleId)
    const vehiclePrice = vehicle ? vehicle.price : 100

    // Calculate duration in days
    const pickupDate = new Date(reservationData.pickupDate)
    const dropoffDate = new Date(reservationData.dropoffDate)
    const durationMs = dropoffDate.getTime() - pickupDate.getTime()
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

    // Calculate base price
    const basePrice = vehiclePrice * durationDays

    // Add additional options
    const optionsPrice = reservationData.additionalOptions
      ? reservationData.additionalOptions.reduce((total, option) => total + option.price * durationDays, 0)
      : 0

    return basePrice + optionsPrice
  }

  // Helper method to get vehicle by ID
  getVehicleById(vehicleId) {
    // In a real app, this would fetch from API
    // For demo, we'll use a mock vehicle
    return {
      id: vehicleId,
      name: "Demo Vehicle",
      price: 150,
    }
  }

  async getReservations() {
    return this.request(this.endpoints.RESERVATIONS)
  }

  async getReservationById(id) {
    return this.request(`${this.endpoints.RESERVATIONS}/${id}`)
  }

  async cancelReservation(id) {
    const endpoint = this.endpoints.CANCEL_RESERVATION.replace(":id", id)
    return this.request(endpoint, "PATCH")
  }

  // Payment methods
  async getPaymentHistory() {
    return this.request(this.endpoints.CUSTOMER_PAYMENTS)
  }

  async getReservationPayments(reservationId) {
    return this.request(`${this.endpoints.RESERVATION_PAYMENTS}/${reservationId}`)
  }
}

// Create and export API service instance
export const api = new ApiService()
