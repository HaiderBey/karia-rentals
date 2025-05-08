import { auth } from "./auth.js"
import { carsData } from "./data.js"
import { api } from "./api.js"

// State management for the reservation process
const reservationState = {
  currentStep: 1,
  selectedVehicle: null,
  pickupDate: null,
  dropoffDate: null,
  pickupLocation: null,
  dropoffLocation: null,
  selectedOptions: [],
  totalPrice: 0,
  paymentMethod: "credit_card",
  reservationId: null,
}

// DOM Elements
const authRequiredMessage = document.getElementById("auth-required-message")
const reservationProcess = document.getElementById("reservation-process")
const progressSteps = document.querySelectorAll(".progress-step")
const reservationSteps = document.querySelectorAll(".reservation-step")
const nextButtons = document.querySelectorAll(".next-step")
const prevButtons = document.querySelectorAll(".prev-step")
const guestView = document.getElementById("guest-view")
const authView = document.getElementById("authenticated-view")
const disconnectBtn = document.getElementById("disconnect-button")

// Vehicle selection elements
const noVehicleSelected = document.getElementById("no-vehicle-selected")
const vehicleSelected = document.getElementById("vehicle-selected")
const vehicleSelectionGrid = document.getElementById("vehicle-selection-grid")
const selectedVehicleImg = document.getElementById("selected-vehicle-img")
const selectedVehicleName = document.getElementById("selected-vehicle-name")
const selectedVehicleBrand = document.getElementById("selected-vehicle-brand")
const selectedVehicleYear = document.getElementById("selected-vehicle-year")
const selectedVehicleTransmission = document.getElementById("selected-vehicle-transmission")
const selectedVehicleFuel = document.getElementById("selected-vehicle-fuel")
const selectedVehicleSeats = document.getElementById("selected-vehicle-seats")
const selectedVehiclePrice = document.getElementById("selected-vehicle-price")
const changeVehicleBtn = document.getElementById("change-vehicle-btn")
const step1Next = document.getElementById("step1-next")

// Date and location elements
const pickupDateInput = document.getElementById("pickup-date")
const dropoffDateInput = document.getElementById("dropoff-date")
const pickupLocationSelect = document.getElementById("pickup-location")
const dropoffLocationSelect = document.getElementById("dropoff-location")
const sameLocationCheckbox = document.getElementById("same-location")
const step2Next = document.getElementById("step2-next")

// Options elements
const optionCheckboxes = document.querySelectorAll('.option-selection input[type="checkbox"]')

// Summary elements
const summaryVehicle = document.getElementById("summary-vehicle")
const summaryDates = document.getElementById("summary-dates")
const summaryDuration = document.getElementById("summary-duration")
const summaryPickup = document.getElementById("summary-pickup")
const summaryDropoff = document.getElementById("summary-dropoff")
const summaryOptions = document.getElementById("summary-options")
const summaryVehiclePrice = document.getElementById("summary-vehicle-price")
const summaryOptionsPrice = document.getElementById("summary-options-price")
const summaryTotalPrice = document.getElementById("summary-total-price")
const paymentMethods = document.querySelectorAll('input[name="payment-method"]')
const creditCardForm = document.getElementById("credit-card-form")
const completeReservationBtn = document.getElementById("complete-reservation")

// Confirmation elements
const confirmationNumber = document.getElementById("confirmation-number")
const confirmationVehicle = document.getElementById("confirmation-vehicle")
const confirmationDates = document.getElementById("confirmation-dates")
const confirmationPickup = document.getElementById("confirmation-pickup")
const confirmationPrice = document.getElementById("confirmation-price")

// Initialize the reservation page
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is authenticated
  checkAuthentication()

  // Setup event listeners
  setupEventListeners()

  // Check for vehicle ID in URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const vehicleId = urlParams.get("vehicleId")

  if (vehicleId) {
    // Find vehicle in data
    const vehicle = carsData.find((car) => car.id.toString() === vehicleId)
    if (vehicle) {
      selectVehicle(vehicle)
    } else {
      // Load available vehicles
      loadVehicles()
    }
  } else {
    // Load available vehicles
    loadVehicles()
  }

  // Set minimum dates for date inputs
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayFormatted = formatDateForInput(today)
  const tomorrowFormatted = formatDateForInput(tomorrow)

  pickupDateInput.min = todayFormatted
  dropoffDateInput.min = tomorrowFormatted
})

// Check if user is authenticated
function checkAuthentication() {
  if (auth.isAuthenticated) {
    // User is authenticated, show reservation process
    authRequiredMessage.style.display = "none"
    reservationProcess.style.display = "block"

    // Update auth view
    guestView.style.display = "none"
    authView.style.display = "block"

    // Setup disconnect button
    if (disconnectBtn) {
      disconnectBtn.addEventListener("click", () => {
        auth.logout()
        window.location.href = "index.html"
      })
    }
  } else {
    // User is not authenticated, show auth required message
    authRequiredMessage.style.display = "block"
    reservationProcess.style.display = "none"

    // Update auth view
    guestView.style.display = "block"
    authView.style.display = "none"
  }
}

// Setup event listeners
function setupEventListeners() {
  // Next step buttons
  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.id === "complete-reservation") {
        completeReservation()
      } else {
        goToNextStep()
      }
    })
  })

  // Previous step buttons
  prevButtons.forEach((button) => {
    button.addEventListener("click", goToPrevStep)
  })

  // Change vehicle button
  if (changeVehicleBtn) {
    changeVehicleBtn.addEventListener("click", () => {
      vehicleSelected.style.display = "none"
      noVehicleSelected.style.display = "block"
      reservationState.selectedVehicle = null
      step1Next.disabled = true
    })
  }

  // Same location checkbox
  if (sameLocationCheckbox) {
    sameLocationCheckbox.addEventListener("change", () => {
      if (sameLocationCheckbox.checked) {
        dropoffLocationSelect.value = pickupLocationSelect.value
        dropoffLocationSelect.disabled = true
      } else {
        dropoffLocationSelect.disabled = false
      }
      validateStep2()
    })
  }

  // Pickup location change
  if (pickupLocationSelect) {
    pickupLocationSelect.addEventListener("change", () => {
      if (sameLocationCheckbox.checked) {
        dropoffLocationSelect.value = pickupLocationSelect.value
      }
      validateStep2()
    })
  }

  // Date inputs change
  if (pickupDateInput) {
    pickupDateInput.addEventListener("change", () => {
      // Set minimum dropoff date to day after pickup
      const pickupDate = new Date(pickupDateInput.value)
      const minDropoffDate = new Date(pickupDate)
      minDropoffDate.setDate(minDropoffDate.getDate() + 1)

      dropoffDateInput.min = formatDateForInput(minDropoffDate)

      // If dropoff date is before new minimum, update it
      const dropoffDate = new Date(dropoffDateInput.value)
      if (dropoffDate <= pickupDate) {
        dropoffDateInput.value = formatDateForInput(minDropoffDate)
      }

      validateStep2()
    })
  }

  if (dropoffDateInput) {
    dropoffDateInput.addEventListener("change", validateStep2)
  }

  if (dropoffLocationSelect) {
    dropoffLocationSelect.addEventListener("change", validateStep2)
  }

  // Option checkboxes
  optionCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateSelectedOptions()
    })
  })

  // Payment method selection
  paymentMethods.forEach((method) => {
    method.addEventListener("change", () => {
      reservationState.paymentMethod = method.value

      // Show/hide credit card form
      if (method.value === "credit_card") {
        creditCardForm.style.display = "block"
      } else {
        creditCardForm.style.display = "none"
      }
    })
  })
}

// Load available vehicles
function loadVehicles() {
  if (!vehicleSelectionGrid) return

  vehicleSelectionGrid.innerHTML = ""

  // Filter only available vehicles
  const availableVehicles = carsData.filter((car) => car.status !== "rented" && car.status !== "maintenance")

  availableVehicles.forEach((vehicle) => {
    const vehicleCard = createVehicleCard(vehicle)
    vehicleSelectionGrid.appendChild(vehicleCard)
  })
}

// Create vehicle card for selection
function createVehicleCard(vehicle) {
  const card = document.createElement("div")
  card.className = "vehicle-card"
  card.dataset.vehicleId = vehicle.id

  card.innerHTML = `
    <div class="vehicle-image">
      <img src="${vehicle.image}" alt="${vehicle.name}">
    </div>
    <div class="vehicle-info">
      <div class="vehicle-name">${vehicle.name} ${vehicle.year}</div>
      <div class="vehicle-type">${vehicle.brand} | ${vehicle.type}</div>
      <div class="vehicle-price">${vehicle.price}.00 <span>/ jour</span></div>
    </div>
  `

  card.addEventListener("click", () => {
    selectVehicle(vehicle)
  })

  return card
}

// Select a vehicle
function selectVehicle(vehicle) {
  reservationState.selectedVehicle = vehicle

  // Update UI
  noVehicleSelected.style.display = "none"
  vehicleSelected.style.display = "block"

  // Update vehicle details
  selectedVehicleImg.src = vehicle.image
  selectedVehicleName.textContent = `${vehicle.name} ${vehicle.year}`
  selectedVehicleBrand.textContent = vehicle.brand
  selectedVehicleYear.textContent = vehicle.year
  selectedVehicleTransmission.textContent = vehicle.transmission
  selectedVehicleFuel.textContent = vehicle.fuel
  selectedVehicleSeats.textContent = `${vehicle.seats} places`
  selectedVehiclePrice.textContent = `${vehicle.price}.00 TND`

  // Enable next button
  step1Next.disabled = false
}

// Validate step 2 (dates and locations)
function validateStep2() {
  const pickupDate = pickupDateInput.value
  const dropoffDate = dropoffDateInput.value
  const pickupLocation = pickupLocationSelect.value
  const dropoffLocation = dropoffLocationSelect.value

  if (pickupDate && dropoffDate && pickupLocation && dropoffLocation) {
    // Store values in state
    reservationState.pickupDate = new Date(pickupDate)
    reservationState.dropoffDate = new Date(dropoffDate)
    reservationState.pickupLocation = pickupLocation
    reservationState.dropoffLocation = dropoffLocation

    // Enable next button
    step2Next.disabled = false
  } else {
    step2Next.disabled = true
  }
}

// Update selected options
function updateSelectedOptions() {
  reservationState.selectedOptions = []

  optionCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      reservationState.selectedOptions.push({
        name: checkbox.dataset.name,
        price: Number.parseFloat(checkbox.dataset.price),
      })
    }
  })
}

// Go to next step
function goToNextStep() {
  // If on step 4, update summary before proceeding
  if (reservationState.currentStep === 3) {
    updateReservationSummary()
  }

  // Hide current step
  reservationSteps[reservationState.currentStep - 1].classList.remove("active")

  // Update progress
  progressSteps[reservationState.currentStep - 1].classList.add("completed")

  // Increment current step
  reservationState.currentStep++

  // Show next step
  reservationSteps[reservationState.currentStep - 1].classList.add("active")
  progressSteps[reservationState.currentStep - 1].classList.add("active")
}

// Go to previous step
function goToPrevStep() {
  // Hide current step
  reservationSteps[reservationState.currentStep - 1].classList.remove("active")
  progressSteps[reservationState.currentStep - 1].classList.remove("active")

  // Decrement current step
  reservationState.currentStep--

  // Show previous step
  reservationSteps[reservationState.currentStep - 1].classList.add("active")
}

// Update reservation summary
function updateReservationSummary() {
  const vehicle = reservationState.selectedVehicle
  const pickupDate = reservationState.pickupDate
  const dropoffDate = reservationState.dropoffDate

  // Calculate duration in days
  const durationMs = dropoffDate.getTime() - pickupDate.getTime()
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

  // Calculate prices
  const vehiclePrice = vehicle.price * durationDays
  const optionsPrice = reservationState.selectedOptions.reduce(
    (total, option) => total + option.price * durationDays,
    0,
  )
  const totalPrice = vehiclePrice + optionsPrice

  // Update summary
  summaryVehicle.textContent = `${vehicle.name} ${vehicle.year}`
  summaryDates.textContent = `${formatDate(pickupDate)} - ${formatDate(dropoffDate)}`
  summaryDuration.textContent = `${durationDays} jour${durationDays > 1 ? "s" : ""}`
  summaryPickup.textContent = reservationState.pickupLocation
  summaryDropoff.textContent = reservationState.dropoffLocation

  // Update options
  if (reservationState.selectedOptions.length > 0) {
    summaryOptions.innerHTML = ""
    reservationState.selectedOptions.forEach((option) => {
      const optionElement = document.createElement("div")
      optionElement.className = "summary-item"
      optionElement.innerHTML = `
        <span class="summary-label">${option.name}:</span>
        <span class="summary-value">${option.price}.00 TND x ${durationDays} jour${durationDays > 1 ? "s" : ""}</span>
      `
      summaryOptions.appendChild(optionElement)
    })
  } else {
    summaryOptions.innerHTML = '<div class="empty-options">Aucune option sélectionnée</div>'
  }

  // Update prices
  summaryVehiclePrice.textContent = `${vehiclePrice}.00 TND`
  summaryOptionsPrice.textContent = `${optionsPrice}.00 TND`
  summaryTotalPrice.textContent = `${totalPrice}.00 TND`

  // Store total price in state
  reservationState.totalPrice = totalPrice
}

// Complete reservation
async function completeReservation() {
  try {
    // Prepare reservation data
    const reservationData = {
      vehicleId: reservationState.selectedVehicle.id,
      pickupLocation: reservationState.pickupLocation,
      dropoffLocation: reservationState.dropoffLocation,
      pickupDate: reservationState.pickupDate.toISOString(),
      dropoffDate: reservationState.dropoffDate.toISOString(),
      additionalOptions: reservationState.selectedOptions.map((option) => ({
        name: option.name,
        price: option.price,
      })),
    }

    // Create reservation
    const response = await api.createReservation(reservationData)

    // Store reservation ID
    reservationState.reservationId = response._id

    // If payment method is not "pay later", process payment
    if (reservationState.paymentMethod !== "pay_later") {
      const paymentData = {
        reservationId: reservationState.reservationId,
        amount: reservationState.totalPrice,
        method: reservationState.paymentMethod,
        transactionId: `TXN-${Date.now()}`,
      }

      await api.processPayment(paymentData)
    }

    // Update confirmation details
    confirmationNumber.textContent = `RES-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(5, "0")}`
    confirmationVehicle.textContent = `${reservationState.selectedVehicle.name} ${reservationState.selectedVehicle.year}`
    confirmationDates.textContent = `${formatDate(reservationState.pickupDate)} - ${formatDate(reservationState.dropoffDate)}`
    confirmationPickup.textContent = reservationState.pickupLocation
    confirmationPrice.textContent = `${reservationState.totalPrice}.00 TND`

    // Go to confirmation step
    goToNextStep()
  } catch (error) {
    console.error("Error completing reservation:", error)
    alert("Une erreur est survenue lors de la réservation. Veuillez réessayer.")
  }
}

// Helper function to format date for display
function formatDate(date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Helper function to format date for input fields
function formatDateForInput(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}
