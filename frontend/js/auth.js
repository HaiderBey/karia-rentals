// Import necessary modules or declare variables
import { STORAGE_KEYS } from "./config.js" // Assuming STORAGE_KEYS is defined in constants.js
import { api } from "./api.js" // Assuming api is defined in api.js

// Authentication Service
class AuthService {
  constructor() {
    this.isAuthenticated = false
    this.user = null
    this.initAuth()
  }

  // Initialize authentication state from localStorage
  initAuth() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const userData = localStorage.getItem(STORAGE_KEYS.USER)

    if (token && userData) {
      this.isAuthenticated = true
      this.user = JSON.parse(userData)
    }
  }

  // Register a new user
  async register(userData) {
    try {
      const response = await api.register(userData)
      this.setAuthData(response.token, response.customer)
      return response
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.login(credentials)
      this.setAuthData(response.token, response.customer)
      return response
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    this.isAuthenticated = false
    this.user = null
    showToast("Vous avez été déconnecté avec succès", "success")
  }

  // Set authentication data
  setAuthData(token, user) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    this.isAuthenticated = true
    this.user = user
  }

  // Check if user is authenticated
  checkAuth() {
    if (!this.isAuthenticated) {
      showToast("Veuillez vous connecter pour continuer", "error")
      openAuthModal()
      return false
    }
    return true
  }

  // Get user profile
  async getProfile() {
    try {
      const profile = await api.getProfile()
      this.user = { ...this.user, ...profile }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user))
      return profile
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const updatedProfile = await api.updateProfile(profileData)
      this.user = { ...this.user, ...updatedProfile }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user))
      return updatedProfile
    } catch (error) {
      console.error("Update profile error:", error)
      alert(error.message || "Une erreur est survenue lors de la mise à jour du profil.");
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      return await api.changePassword(passwordData)
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  }

  // Upload driving license
  async uploadLicense(licenseData) {
    try {
      const response = await api.uploadLicense(licenseData)
      this.user = { ...this.user, ...response.customer }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user))
      return response
    } catch (error) {
      console.error("Upload license error:", error)
      throw error
    }
  }

  // Upload identity document
  async uploadIdentity(identityData) {
    try {
      const response = await api.uploadIdentity(identityData)
      this.user = { ...this.user, ...response.customer }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user))
      return response
    } catch (error) {
      console.error("Upload identity error:", error)
      throw error
    }
  }

  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Treat invalid tokens as expired
    }
  }
}

// Create auth service instance
export const auth = new AuthService()

// Helper function to open auth modal
function openAuthModal() {
  const authModal = document.getElementById("authModal")
  const modalOverlay = document.getElementById("modalOverlay")

  if (authModal) authModal.classList.add("active")
  if (modalOverlay) modalOverlay.classList.add("active")
}

// Helper function to show toast notification
function showToast(message, type = "info") {
  const toast = document.getElementById("toast")
  const toastContent = document.getElementById("toastContent")

  if (!toast || !toastContent) return

  // Set message and type
  toastContent.textContent = message
  toast.className = `toast ${type}`

  // Show toast
  toast.classList.add("show")

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Helper function to close modal
function closeModal(modal) {
  if (!modal) return

  modal.classList.remove("active")
  const modalOverlay = document.getElementById("modalOverlay")
  if (modalOverlay) modalOverlay.classList.remove("active")
}

// Helper function to close all modals
function closeAllModals() {
  const modals = document.querySelectorAll(".modal")
  const modalOverlay = document.getElementById("modalOverlay")

  modals.forEach((modal) => modal.classList.remove("active"))
  if (modalOverlay) modalOverlay.classList.remove("active")
}

// Helper functions to open profile and reservations modals
function openProfileModal() {
  console.log("Opening profile modal")
}

function openReservationsModal() {
  console.log("Opening reservations modal")
}

// Auth UI Event Handlers
document.addEventListener("DOMContentLoaded", () => {
  const authButton = document.getElementById("authButton")
  const authModal = document.getElementById("authModal")
  const closeAuthModal = document.getElementById("closeAuthModal")
  const modalOverlay = document.getElementById("modalOverlay")
  const authTabs = document.querySelectorAll(".auth-tab")
  const authForms = document.querySelectorAll(".auth-form")
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const loginError = document.getElementById("loginError")
  const registerError = document.getElementById("registerError")
  const logoutButton = document.getElementById("logoutButton")
  const profileButton = document.getElementById("profileButton")
  const reservationsButton = document.getElementById("reservationsButton")

  // Open auth modal
  if (authButton) {
    authButton.addEventListener("click", openAuthModal)
  }

  // Close auth modal
  if (closeAuthModal) {
    closeAuthModal.addEventListener("click", () => closeModal(authModal))
  }

  // Close modal when clicking overlay
  if (modalOverlay) {
    modalOverlay.addEventListener("click", closeAllModals)
  }

  // Switch between auth tabs
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab")

      authTabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")

      authForms.forEach((form) => {
        form.classList.remove("active")
        if (form.id === `${tabName}Form`) {
          form.classList.add("active")
        }
      })

      if (loginError) loginError.textContent = ""
      if (registerError) registerError.textContent = ""
    })
  })

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("loginEmail").value
      const password = document.getElementById("loginPassword").value

      try {
        await auth.login({ email, password })
        closeModal(authModal)
        showToast("Connexion réussie", "success")
      } catch (error) {
        if (loginError) loginError.textContent = error.message
      }
    })
  }

  // Register form submission
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const firstName = document.getElementById("registerFirstName").value
      const lastName = document.getElementById("registerLastName").value
      const email = document.getElementById("registerEmail").value
      const phone = document.getElementById("registerPhone").value
      const password = document.getElementById("registerPassword").value
      const confirmPassword = document.getElementById("registerConfirmPassword").value

      if (password !== confirmPassword) {
        if (registerError) registerError.textContent = "Les mots de passe ne correspondent pas"
        return
      }

      try {
        await auth.register({
          firstName,
          lastName,
          email,
          phone,
          password,
          address: {},
        })
        closeModal(authModal)
        showToast("Inscription réussie", "success")
      } catch (error) {
        if (registerError) registerError.textContent = error.message
      }
    })
  }

  // Logout button
  if (logoutButton) {
    logoutButton.addEventListener("click", auth.logout.bind(auth))
  }

  // Profile button
  if (profileButton) {
    profileButton.addEventListener("click", openProfileModal)
  }

  // Reservations button
  if (reservationsButton) {
    reservationsButton.addEventListener("click", openReservationsModal)
  }
})
