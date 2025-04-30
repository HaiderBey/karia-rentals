import {brandsData, carsData, typesData} from '/frontend/js/data.js';

document.addEventListener("DOMContentLoaded", () => {

  loadBrands()
  loadTypes()
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

  // Brand cards functionality
  const brandCards = document.querySelectorAll(".brand-card")
  brandCards.forEach((card) => {
    card.addEventListener("click", function () {
      const brand = this.getAttribute("data-brand")

      // Filter cars by brand
      filterCarsByBrand(brand)

      // Scroll to cars section
      document.getElementById("cars").scrollIntoView({ behavior: "smooth" })
    })
  })

  // Car type cards functionality
  const carTypeCards = document.querySelectorAll(".car-type-card")
  carTypeCards.forEach((card) => {
    card.addEventListener("click", function () {
      const type = this.getAttribute("data-type")

      // Filter cars by type
      filterCarsByType(type)

      // Scroll to cars section
      document.getElementById("cars").scrollIntoView({ behavior: "smooth" })
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

let currentBrands = []
let displayedBrands = 12

let currentTypes = []
let displayedTypes = 12

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

function loadBrands(){
  const brandsGrid = document.getElementById("brandsGrid")
  currentBrands = [...brandsData]

  brandsGrid.innerHTML = ""

  const brandsToDisplay = currentBrands.slice(0, displayedBrands)

  brandsToDisplay.forEach((brand) => {
    const brandCard = createBrandCard(brand)
    brandsGrid.appendChild(brandCard)
  })
}

function loadTypes(){
  const brandsGrid = document.getElementById("typesGrid")
  currentTypes = [...typesData]

  typesGrid.innerHTML = ""

  const typesToDisplay = currentTypes.slice(0, displayedTypes)

  typesToDisplay.forEach((type) => {
    const typeCard = createTypeCard(type)
    typesGrid.appendChild(typeCard)
  })
}

// Card Creation Functions
function createBrandCard(brand){
  const brandCard = document.createElement("div")
  brandCard.className = "brand-card"
  brandCard.dataset.brand = brand.brand

  brandCard.innerHTML = `
    <img src="${brand.image}" alt="${brand.brand}">
    <p>${brand.brand}</p>
  `

  return brandCard
}

function createTypeCard(type){
  const typeCard = document.createElement("div")
  typeCard.className = "car-type-card"
  typeCard.dataset.brand = type.type

  typeCard.innerHTML = `
    <img src="${type.icon}" alt="${type.type}">
    <p>${type.type}</p>
  `

  return typeCard
}

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
