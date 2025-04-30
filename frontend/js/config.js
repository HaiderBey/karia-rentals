// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api", // Change this to your actual API URL in production
  ENDPOINTS: {
    // Authentication
    REGISTER: "/customers/register",
    LOGIN: "/customers/login",
    PROFILE: "/customers/profile",
    CHANGE_PASSWORD: "/customers/change-password",
    UPLOAD_LICENSE: "/customers/upload-license",
    UPLOAD_IDENTITY: "/customers/upload-identity",
    RENTAL_HISTORY: "/customers/rental-history",

    // Vehicles
    VEHICLES: "/vehicles",
    VEHICLE_AVAILABILITY: "/vehicles/check-availability",

    // Reservations
    RESERVATIONS: "/reservations",
    CANCEL_RESERVATION: "/reservations/:id/cancel",

    // Payments
    PAYMENTS: "/payments",
    CUSTOMER_PAYMENTS: "/payments/customer/history",
    RESERVATION_PAYMENTS: "/payments/reservation",
  },
}

// Local Storage Keys
const STORAGE_KEYS = {
  TOKEN: "karia_token",
  USER: "karia_user",
}

// Default Images
const DEFAULT_IMAGES = {
  VEHICLE: "/frontend/images/placeholder.svg",
  USER: "/frontend/images/user-placeholder.svg",
}

// Reservation Status Colors
const STATUS_COLORS = {
  pending: "#f39c12",
  confirmed: "#3498db",
  active: "#2ecc71",
  completed: "#27ae60",
  cancelled: "#e74c3c",
}

// Vehicle Status Labels
const VEHICLE_STATUS = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "En maintenance",
}

// Export the configuration objects
export { API_CONFIG, STORAGE_KEYS, DEFAULT_IMAGES, STATUS_COLORS, VEHICLE_STATUS }
