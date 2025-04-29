document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle")
  const navMenu = document.querySelector(".nav-menu")

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })
  }

  // Date picker initialization (simple version without library)
  const dateInputs = document.querySelectorAll('input[id$="Date"]')
  dateInputs.forEach((input) => {
    input.addEventListener("focus", (e) => {
      e.target.type = "date"
    })
    input.addEventListener("blur", (e) => {
      if (!e.target.value) {
        e.target.type = "text"
      }
    })
  })

  // Load cars
  loadCars()

  // Load testimonials
  loadTestimonials()

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

  // Testimonial slider navigation
  const prevTestimonialBtn = document.getElementById("prevTestimonial")
  const nextTestimonialBtn = document.getElementById("nextTestimonial")

  if (prevTestimonialBtn && nextTestimonialBtn) {
    prevTestimonialBtn.addEventListener("click", () => {
      navigateTestimonials("prev")
    })

    nextTestimonialBtn.addEventListener("click", () => {
      navigateTestimonials("next")
    })
  }
})

// Global variables
let currentCars = []
let displayedCars = 6
let currentTestimonial = 0

// Sample car data (replace with your actual data source)
const carsData = [
  {
    id: 1,
    name: "Toyota Camry",
    year: 2022,
    price: 25000,
    mileage: "25,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "sedan",
    brand: "Toyota",
    type: "family",
  },
  {
    id: 2,
    name: "Honda Civic",
    year: 2023,
    price: 24000,
    mileage: "15,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "sedan",
    brand: "Honda",
    type: "compact",
  },
  {
    id: 3,
    name: "Ford Mustang",
    year: 2021,
    price: 35000,
    mileage: "30,000 km",
    transmission: "Manual",
    seats: 4,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "sports",
    brand: "Ford",
    type: "sports",
  },
  {
    id: 4,
    name: "BMW X5",
    year: 2022,
    price: 60000,
    mileage: "10,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "suv",
    brand: "BMW",
    type: "luxury",
  },
  {
    id: 5,
    name: "Mercedes C-Class",
    year: 2023,
    price: 55000,
    mileage: "5,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "sedan",
    brand: "Mercedes",
    type: "luxury",
  },
  {
    id: 6,
    name: "Audi A4",
    year: 2022,
    price: 45000,
    mileage: "12,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "sedan",
    brand: "Audi",
    type: "luxury",
  },
  {
    id: 7,
    name: "Nissan Rogue",
    year: 2023,
    price: 28000,
    mileage: "8,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "suv",
    brand: "Nissan",
    type: "family",
  },
  {
    id: 8,
    name: "Chevrolet Silverado",
    year: 2022,
    price: 38000,
    mileage: "18,000 km",
    transmission: "Automatic",
    seats: 6,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "truck",
    brand: "Chevrolet",
    type: "truck",
  },
  {
    id: 9,
    name: "GMC Sierra",
    year: 2023,
    price: 42000,
    mileage: "6,000 km",
    transmission: "Automatic",
    seats: 6,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "truck",
    brand: "GMC",
    type: "truck",
  },
  {
    id: 10,
    name: "Jeep Wrangler",
    year: 2022,
    price: 40000,
    mileage: "22,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "suv",
    brand: "Jeep",
    type: "offroad",
  },
  {
    id: 11,
    name: "Subaru Outback",
    year: 2023,
    price: 32000,
    mileage: "14,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "wagon",
    brand: "Subaru",
    type: "family",
  },
  {
    id: 12,
    name: "Volkswagen Golf",
    year: 2022,
    price: 26000,
    mileage: "20,000 km",
    transmission: "Automatic",
    seats: 5,
    fuel: "Gasoline",
    image: "https://via.placeholder.com/350x200",
    category: "hatchback",
    brand: "Volkswagen",
    type: "compact",
  },
]

// Sample testimonials data (replace with your actual data source)
const testimonialsData = [
  {
    id: 1,
    name: "John Doe",
    location: "New York",
    text: "Great service and excellent cars! I highly recommend this car rental company.",
    image: "https://via.placeholder.com/50x50",
  },
  {
    id: 2,
    name: "Jane Smith",
    location: "Los Angeles",
    text: "I had a wonderful experience renting a car from this company. The car was clean and well-maintained.",
    image: "https://via.placeholder.com/50x50",
  },
  {
    id: 3,
    name: "Peter Jones",
    location: "Chicago",
    text: "The staff was very friendly and helpful. I will definitely rent from them again.",
    image: "https://via.placeholder.com/50x50",
  },
]

// Load cars function
function loadCars(filter = "all") {
  const carsGrid = document.getElementById("carsGrid")
  if (!carsGrid) return

  // Filter cars based on the selected filter
  if (filter === "all") {
    currentCars = [...carsData]
  } else {
    currentCars = carsData.filter((car) => car.category === filter)
  }

  // Clear the grid
  carsGrid.innerHTML = ""

  // Display the first batch of cars
  const carsToDisplay = currentCars.slice(0, displayedCars)

  carsToDisplay.forEach((car) => {
    const carCard = createCarCard(car)
    carsGrid.appendChild(carCard)
  })

  // Update the load more button visibility
  updateLoadMoreButton()
}

// Create car card function
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

// Load testimonials function
function loadTestimonials() {
  const testimonialsSlider = document.getElementById("testimonialsSlider")
  if (!testimonialsSlider) return

  // Clear the slider
  testimonialsSlider.innerHTML = ""

  // Create testimonial element
  const testimonial = createTestimonialElement(testimonialsData[currentTestimonial])

  // Add testimonial to the slider
  testimonialsSlider.appendChild(testimonial)
}

// Create testimonial element function
function createTestimonialElement(testimonial) {
  const testimonialElement = document.createElement("div")
  testimonialElement.className = "testimonial"

  testimonialElement.innerHTML = `
        <p class="testimonial-content">"${testimonial.text}"</p>
        <div class="testimonial-author">
            <div class="author-image">
                <img src="${testimonial.image}" alt="${testimonial.name}">
            </div>
            <div class="author-info">
                <h4>${testimonial.name}</h4>
                <p>De ${testimonial.location}</p>
            </div>
        </div>
    `

  return testimonialElement
}

// Navigate testimonials function
function navigateTestimonials(direction) {
  if (direction === "prev") {
    currentTestimonial = (currentTestimonial - 1 + testimonialsData.length) % testimonialsData.length
  } else {
    currentTestimonial = (currentTestimonial + 1) % testimonialsData.length
  }

  loadTestimonials()
}
