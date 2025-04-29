import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import { fileURLToPath } from "url"

// Generate invoice PDF
export const generateInvoice = async (payment) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get payment details with populated references
      await payment.populate("reservation")
      await payment.populate("customer")
      await payment.reservation.populate("vehicle")

      const __dirname = path.dirname(fileURLToPath(import.meta.url))
      const invoicesDir = path.join(__dirname, "../public/invoices")

      // Create invoices directory if it doesn't exist
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true })
      }

      const invoicePath = path.join(invoicesDir, `${payment.invoiceNumber}.pdf`)
      const invoiceUrl = `/invoices/${payment.invoiceNumber}.pdf`

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 })

      // Pipe PDF to file
      doc.pipe(fs.createWriteStream(invoicePath))

      // Add company logo and header
      doc.fontSize(20).text("KARIA Car Rental", { align: "center" })
      doc.moveDown()
      doc.fontSize(12).text("Invoice", { align: "center" })
      doc.moveDown()

      // Add invoice details
      doc.fontSize(10)
      doc.text(`Invoice Number: ${payment.invoiceNumber}`)
      doc.text(`Date: ${payment.paymentDate.toLocaleDateString()}`)
      doc.moveDown()

      // Add customer details
      doc.text("Customer Details:")
      doc.text(`Name: ${payment.customer.firstName} ${payment.customer.lastName}`)
      doc.text(`Email: ${payment.customer.email}`)
      doc.text(`Phone: ${payment.customer.phone}`)
      doc.moveDown()

      // Add reservation details
      doc.text("Reservation Details:")
      doc.text(
        `Vehicle: ${payment.reservation.vehicle.brand} ${payment.reservation.vehicle.model} (${payment.reservation.vehicle.year})`,
      )
      doc.text(`License Plate: ${payment.reservation.vehicle.licensePlate}`)
      doc.text(
        `Pickup: ${payment.reservation.pickupLocation} on ${payment.reservation.pickupDate.toLocaleDateString()}`,
      )
      doc.text(
        `Dropoff: ${payment.reservation.dropoffLocation} on ${payment.reservation.dropoffDate.toLocaleDateString()}`,
      )
      doc.moveDown()

      // Add payment details
      doc.text("Payment Details:")
      doc.text(`Amount: $${payment.amount.toFixed(2)}`)
      doc.text(`Method: ${payment.method}`)
      doc.text(`Status: ${payment.status}`)
      doc.text(`Transaction ID: ${payment.transactionId}`)
      doc.moveDown()

      // Add total amount
      doc.fontSize(12).text(`Total Amount: $${payment.reservation.totalPrice.toFixed(2)}`, { align: "right" })
      doc.text(`Amount Paid: $${payment.amount.toFixed(2)}`, { align: "right" })

      // Add footer
      doc.fontSize(10).text("Thank you for choosing KARIA Car Rental!", { align: "center" })

      // Finalize PDF
      doc.end()

      resolve(invoiceUrl)
    } catch (error) {
      reject(error)
    }
  })
}
