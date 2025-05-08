import { carsData } from "/frontend/js/data.js"
import { STORAGE_KEYS } from "/frontend/js/config.js"
import { auth } from "/frontend/js/auth.js"

// ✅ Token validation before DOM loads
const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
if (!token || auth.isTokenExpired(token)) {
  auth.logout() // Auto logout if token invalid/expired
}

document.addEventListener("DOMContentLoaded", () => {
  loadCars()

  // Filter buttons functionality
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter")

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Filter cars
      filterCars(filter)
    })
  })

  // Load more cars button
  const loadMoreBtn = document.getElementById("loadMoreCars")
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      loadMoreCars()
    })
  }

  // Handle logout button if present
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.style.display = "block"
    logoutBtn.addEventListener("click", auth.logout)
  }
})

let currentCars = []
let displayedCars = 6

// Load and filter cars
function loadCars(filter = "all") {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  currentCars = filter === "all" ? [...carsData] : carsData.filter((car) => car.category === filter)

  carsGrid.innerHTML = ""
  const carsToDisplay = currentCars.slice(0, displayedCars)
  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  updateLoadMoreButton()
}

export function createCarCard(car) {
  const carCard = document.createElement("div")
  carCard.className = "car-card"

  carCard.innerHTML = `
        <div class="car-image">
            <img src="${car.image}" alt="${car.name}">
        </div>
        <div class="car-details">
            <h3 class="car-title">${car.name} ${car.year}</h3>
            <div class="car-price">${car.price}.00 <span>/jour</span></div>
            <div class="car-features">
                <div class="feature"><i class="fas fa-tachometer-alt"></i><span>${car.mileage}</span></div>
                <div class="feature"><i class="fas fa-cog"></i><span>${car.transmission}</span></div>
                <div class="feature"><i class="fas fa-user"></i><span>${car.seats} Personnes</span></div>
                <div class="feature"><i class="fas fa-gas-pump"></i><span>${car.fuel}</span></div>
            </div>
            <button class="btn btn-primary rent-now-btn" data-vehicle-id="${car.id}">Louer Maintenant</button>
        </div>
    `

  // Add event listener to the rent now button
  const rentNowBtn = carCard.querySelector(".rent-now-btn")
  if (rentNowBtn) {
    rentNowBtn.addEventListener("click", (e) => {
      e.preventDefault()
      const vehicleId = rentNowBtn.getAttribute("data-vehicle-id")
      window.location.href = `reservation.html?vehicleId=${vehicleId}`
    })
  }

  return carCard
}

function filterCars(filter) {
  displayedCars = 6
  loadCars(filter)
}

function filterCarsByBrand(brand) {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  currentCars = carsData.filter((car) => car.brand === brand)
  carsGrid.innerHTML = ""

  displayedCars = 6
  const carsToDisplay = currentCars.slice(0, displayedCars)
  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  updateLoadMoreButton()
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelector(".filter-btn[data-filter='all']").classList.add("active")
}

function filterCarsByType(type) {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  currentCars = carsData.filter((car) => car.type === type)
  carsGrid.innerHTML = ""

  displayedCars = 6
  const carsToDisplay = currentCars.slice(0, displayedCars)
  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  updateLoadMoreButton()
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelector(".filter-btn[data-filter='all']").classList.add("active")
}

function loadMoreCars() {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  displayedCars += 6
  const carsToDisplay = currentCars.slice(0, displayedCars)
  carsGrid.innerHTML = ""

  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  updateLoadMoreButton()
}

function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById("loadMoreCars")
  if (!loadMoreBtn) return

  loadMoreBtn.style.display = displayedCars >= currentCars.length ? "none" : "inline-flex"
}
