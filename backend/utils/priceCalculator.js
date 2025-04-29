// Calculate reservation price
export const calculateReservationPrice = (vehicle, pickupDate, dropoffDate, additionalOptions = []) => {
  // Calculate number of days
  const pickupTime = new Date(pickupDate).getTime()
  const dropoffTime = new Date(dropoffDate).getTime()
  const durationMs = dropoffTime - pickupTime
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

  // Base price calculation
  const basePrice = vehicle.pricePerDay * durationDays

  // Add additional options
  const optionsPrice = additionalOptions.reduce((total, option) => total + option.price, 0)

  // Apply any discounts for longer rentals
  let discount = 0
  if (durationDays >= 7 && durationDays < 30) {
    // 10% discount for weekly rentals
    discount = basePrice * 0.1
  } else if (durationDays >= 30) {
    // 20% discount for monthly rentals
    discount = basePrice * 0.2
  }

  // Calculate total price
  const totalPrice = basePrice + optionsPrice - discount

  return Math.round(totalPrice * 100) / 100 // Round to 2 decimal places
}
