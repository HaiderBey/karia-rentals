import {brandsData, carsData, typesData} from '/frontend/js/data.js';

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
})

let currentCars = []
let displayedCars = 6

// Loading Data Functions
function loadCars(filter = "all") {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  // Filtering
  if (filter === "all") {
    currentCars = [...carsData]
  } else {
    currentCars = carsData.filter((car) => car.category === filter)
  }

  carsGrid.innerHTML = ""

  // Display
  const carsToDisplay = currentCars.slice(0, displayedCars)

  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  updateLoadMoreButton()
}

// Card Creation Functions
function createCarCard(car) {
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
                <div class="feature">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>${car.mileage}</span>
                </div>
                <div class="feature">
                    <i class="fas fa-cog"></i>
                    <span>${car.transmission}</span>
                </div>
                <div class="feature">
                    <i class="fas fa-user"></i>
                    <span>${car.seats} Personnes</span>
                </div>
                <div class="feature">
                    <i class="fas fa-gas-pump"></i>
                    <span>${car.fuel}</span>
                </div>
            </div>
            <button class="btn btn-primary">Louer Maintenant</button>
        </div>
    `

  return carCard
}

// Filter cars function
function filterCars(filter) {
  // Reset displayed cars count
  displayedCars = 6

  // Load cars with the selected filter
  loadCars(filter)
}

// Filter cars by brand function
function filterCarsByBrand(brand) {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  // Filter cars based on the selected brand
  currentCars = carsData.filter((car) => car.brand === brand)

  // Clear the grid
  carsGrid.innerHTML = ""

  // Reset displayed cars count
  displayedCars = 6

  // Display the first batch of cars
  const carsToDisplay = currentCars.slice(0, displayedCars)

  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  // Update the load more button visibility
  updateLoadMoreButton()

  // Update filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((btn) => btn.classList.remove("active"))
  filterButtons[0].classList.add("active")
}

// Filter cars by type function
function filterCarsByType(type) {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  // Filter cars based on the selected type
  currentCars = carsData.filter((car) => car.type === type)

  // Clear the grid
  carsGrid.innerHTML = ""

  // Reset displayed cars count
  displayedCars = 6

  // Display the first batch of cars
  const carsToDisplay = currentCars.slice(0, displayedCars)

  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  // Update the load more button visibility
  updateLoadMoreButton()

  // Update filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((btn) => btn.classList.remove("active"))
  filterButtons[0].classList.add("active")
}

// Load more cars function
function loadMoreCars() {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  // Increase the number of displayed cars
  displayedCars += 6

  // Display more cars
  const carsToDisplay = currentCars.slice(0, displayedCars)

  // Clear the grid
  carsGrid.innerHTML = ""

  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  // Update the load more button visibility
  updateLoadMoreButton()
}

// Update load more button visibility
function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById("loadMoreCars")
  if (!loadMoreBtn) return

  if (displayedCars >= currentCars.length) {
    loadMoreBtn.style.display = "none"
  } else {
    loadMoreBtn.style.display = "inline-flex"
  }
}
