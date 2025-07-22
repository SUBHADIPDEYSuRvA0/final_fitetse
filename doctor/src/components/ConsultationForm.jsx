"use client"

import { useState, useEffect } from "react"
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/themes/material_green.css"
import Lottie from "lottie-react"
import animationData from "../assets/anime.json"
import "./ConsultationForm.css"

const ConsultationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    datetime: "",
    description: "",
  })

  const [slots, setSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlotId, setSelectedSlotId] = useState("")
  const [availableDates, setAvailableDates] = useState([])

  const [showQuestion, setShowQuestion] = useState(false)
  const [selectedAnswer1, setSelectedAnswer1] = useState("")
  const [selectedAnswer2, setSelectedAnswer2] = useState("")

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' ? "https://dashboard.fitetse.com" : ""

  // Fetch slots from backend API
  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch(`${API_BASE_URL}/api/slots`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Filter only available slots
        const availableSlots = data.filter((slot) => slot.status === "available")
        setSlots(availableSlots)

        // Extract unique dates from available slots
        const uniqueDates = [...new Set(availableSlots.map((slot) => new Date(slot.start).toLocaleDateString()))]
        setAvailableDates(uniqueDates)
      } catch (error) {
        console.error("Error fetching slots:", error)
        setError("Failed to load available slots. Please try again later.")

        // Fallback to mock data if API fails
        const mockSlots = [
          { _id: "1", start: "2025-07-14T09:00:00", end: "2025-07-14T09:30:00", status: "available" },
          { _id: "2", start: "2025-07-14T10:00:00", end: "2025-07-14T10:30:00", status: "available" },
          { _id: "3", start: "2025-07-15T09:30:00", end: "2025-07-15T10:00:00", status: "available" },
        ]
        setSlots(mockSlots)

        const uniqueDates = [...new Set(mockSlots.map((slot) => new Date(slot.start).toLocaleDateString()))]
        setAvailableDates(uniqueDates)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [])

  const handleDateChange = (selectedDates) => {
    const date = selectedDates[0]
    if (date) {
      const formatted = date.toLocaleDateString()
      setSelectedDate(formatted)
      setSelectedSlotId("")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    const selectedSlot = slots.find((s) => s._id === selectedSlotId)
    if (!selectedSlot) {
      setError("Please select a valid time slot.")
      return
    }

    // Show MCQ popup
    setShowQuestion(true)
  }

  // Submit form data to backend
  const handleConfirm = async () => {
    if (!selectedAnswer1 || !selectedAnswer2) {
      setError("Please answer both questions before proceeding.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const selectedSlot = slots.find((s) => s._id === selectedSlotId)

      // Format date for API (MM/DD/YYYY format)
      const selectedDateFormatted = new Date(selectedSlot.start).toLocaleDateString("en-US")

      // Format date for API (YYYY-MM-DD format)
      const dateForAPI = new Date(selectedSlot.start).toISOString().split("T")[0]

      // Prepare submission data according to API format
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        date: dateForAPI,
        slotId: selectedSlotId,
        selectedDate: selectedDateFormatted,
        question: {
          // Using hardcoded question IDs - you may need to adjust these based on your backend
          question1_id: selectedAnswer1,
          question2_id: selectedAnswer2,
        },
      }

      console.log("Submitting data:", submissionData)

      const response = await fetch(`${API_BASE_URL}/admin/request-videocall`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Booking successful:", result)

      setSuccess("Your consultation has been booked successfully! We'll contact you soon.")

      // Close the MCQ popup
      setShowQuestion(false)

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        datetime: "",
        description: "",
      })
      setSelectedDate("")
      setSelectedSlotId("")
      setSelectedAnswer1("")
      setSelectedAnswer2("")

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess("")
      }, 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error.message || "Failed to book consultation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderTimeSlots = () => {
    const filteredSlots = slots.filter((slot) => new Date(slot.start).toLocaleDateString() === selectedDate)

    if (filteredSlots.length === 0) return <div className="text-muted">No slots available for this date.</div>

    return filteredSlots.map((slot) => {
      const timeRange = `${new Date(slot.start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(slot.end).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`

      return (
        <div
          key={slot._id}
          className={`time-slot ${selectedSlotId === slot._id ? "selected" : ""}`}
          onClick={() => setSelectedSlotId(slot._id)}
        >
          {timeRange}
        </div>
      )
    })
  }

  return (
    <div className="consultation-form-container">
      <div className="form-left">
        <Lottie animationData={animationData} loop autoplay />
      </div>

      <div className="form-right">
        <h2>Speak to Our Consultant</h2>

        {/* Error Message */}
        {error && (
          <div
            style={{
              color: "#dc3545",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            style={{
              color: "#155724",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        {/* Loading Message */}
        {isLoading && (
          <div
            style={{
              color: "#856404",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            Loading available slots...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Your Email"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter Location"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Select Date</label>
            <Flatpickr
              options={{
                dateFormat: "Y-m-d",
                minDate: "today",
                disable: [
                  (date) => {
                    const formatted = date.toLocaleDateString()
                    return !availableDates.includes(formatted)
                  },
                ],
              }}
              onChange={handleDateChange}
              placeholder="Select available date"
              className="custom-datepicker-input"
              disabled={isLoading}
            />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>Select Time Slot</label>
              <div className="time-slots-container">{renderTimeSlots()}</div>
            </div>
          )}

          <div className="form-group">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading || isSubmitting}>
            {isSubmitting ? "Booking..." : "Submit ➝"}
          </button>
        </form>

        {showQuestion && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Quick Question Before You Submit</h3>

              <p>1. What is the recommended amount of daily physical activity for adults?</p>
              <div className="mcq-options">
                {["10 minutes", "30 minutes", "1 hour", "2 hour"].map((opt) => (
                  <label key={opt}>
                    <input
                      type="radio"
                      name="mcq1"
                      value={opt}
                      onChange={(e) => setSelectedAnswer1(e.target.value)}
                      checked={selectedAnswer1 === opt}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              <p>2. Which of the following is a form of cardiovascular exercise?</p>
              <div className="mcq-options">
                {["Push-ups", "Sit-ups", "Running", "Plank"].map((opt) => (
                  <label key={opt}>
                    <input
                      type="radio"
                      name="mcq2"
                      value={opt}
                      onChange={(e) => setSelectedAnswer2(e.target.value)}
                      checked={selectedAnswer2 === opt}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {error && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "14px",
                    marginTop: "10px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <button onClick={handleConfirm} className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Booking..." : "Book Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsultationForm
