// Import API configuration and storage keys
import { API_CONFIG } from "./config/apiConfig"
import { STORAGE_KEYS } from "./config/storageKeys"

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

  // Reservation methods
  async createReservation(reservationData) {
    return this.request(this.endpoints.RESERVATIONS, "POST", reservationData)
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
  async processPayment(paymentData) {
    return this.request(this.endpoints.PAYMENTS, "POST", paymentData)
  }

  async getPaymentHistory() {
    return this.request(this.endpoints.CUSTOMER_PAYMENTS)
  }

  async getReservationPayments(reservationId) {
    return this.request(`${this.endpoints.RESERVATION_PAYMENTS}/${reservationId}`)
  }
}

// Create and export API service instance
const api = new ApiService()
