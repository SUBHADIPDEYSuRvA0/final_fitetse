"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import "./SignUp.css"
import { Link } from "react-router-dom"

// Add these API functions after the imports and before the component
const API_BASE_URL = "https://dashboard.fitetse.com" // Adjust based on your backend URL

// API function to submit signup data
const submitSignupData = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Signup failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Signup API Error:", error)
    throw error
  }
}

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [phone, setPhone] = useState("")

  // Add state for loading and error handling
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const canvasRef = useRef(null)

  const setCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    class DocumentIcon {
      constructor(centerX, centerY) {
        this.centerX = centerX
        this.centerY = centerY
        this.orbitRadius = 50 + Math.random() * 200
        this.orbitAngle = Math.random() * Math.PI * 2
        this.orbitSpeed = 0.0005 + Math.random() * 0.001
        this.size = 15 + Math.random() * 15
        this.angle = Math.random() * Math.PI * 2
        this.rotationSpeed = 0.001 + Math.random() * 0.002
        this.x = centerX + Math.cos(this.orbitAngle) * this.orbitRadius
        this.y = centerY + Math.sin(this.orbitAngle) * this.orbitRadius
      }

      update() {
        this.orbitAngle += this.orbitSpeed
        this.x = this.centerX + Math.cos(this.orbitAngle) * this.orbitRadius
        this.y = this.centerY + Math.sin(this.orbitAngle) * this.orbitRadius
        this.angle += this.rotationSpeed
      }

      draw(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)

        // Draw document icon
        ctx.beginPath()
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size * 0.8)
        ctx.moveTo(-this.size / 2, -this.size / 2)
        ctx.lineTo(-this.size / 2 + this.size / 3, -this.size / 2)
        ctx.lineTo(-this.size / 2 + this.size / 3, -this.size / 2 - this.size / 5)
        ctx.lineTo(-this.size / 2 + (this.size / 3) * 2, -this.size / 2 - this.size / 5)
        ctx.lineTo(-this.size / 2 + (this.size / 3) * 2, -this.size / 2)
        ctx.lineTo(this.size / 2, -this.size / 2)

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      }
    }

    class Circle {
      constructor(x, y, radius) {
        this.x = x
        this.y = y
        this.radius = radius
      }

      draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const documents = []

    for (let i = 0; i < 12; i++) {
      documents.push(new DocumentIcon(centerX, centerY))
    }

    const circles = [
      new Circle(centerX, centerY, 80),
      new Circle(centerX, centerY, 150),
      new Circle(centerX, centerY, 220),
    ]

    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw circles
      circles.forEach((circle) => circle.draw(ctx))

      // Update and draw documents
      documents.forEach((doc) => {
        doc.update()
        doc.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [setCanvasDimensions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms & Conditions")
      return
    }

    if (!phone.trim()) {
      setError("Phone number is required")
      return
    }

    setIsLoading(true)

    try {
      const signupData = {
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
      }

      const response = await fetch("https://dashboard.fitetse.com/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`)
      }

      setSuccess("Account created successfully! Please check your email for verification.")

      // Reset form after successful signup
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setPassword("")
      setConfirmPassword("")
      setAgreeToTerms(false)

      console.log("Signup successful:", result)

      // Optional: Redirect to login page after successful signup
      // setTimeout(() => {
      //   window.location.href = '/login';
      // }, 2000);
    } catch (error) {
      console.error("Signup error:", error)
      setError(error.message || "An error occurred during signup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-container-sp">
      {/* Left side with animation */}
      <div className="signup-left-sp">
        <canvas ref={canvasRef} className="animation-canvas"></canvas>

        <div className="logo-container">{/* Logo content can be added here if needed */}</div>
      </div>

      {/* Right side with signup form */}
      <div className="signup-right-sp">
        <div className="signup-form-container-sp">
          <div className="signup-header-sp">
            <h2 className="form-title">SIGN UP</h2>
            <p className="form-subtitle">Create your account to get started</p>
          </div>

          <form className="signup-form-sp" onSubmit={handleSubmit}>
            <div className="form-row-sp">
              <div className="form-group1">
                <label htmlFor="first-name" className="form-label">
                  First Name
                </label>
                <input
                  id="first-name"
                  className="form-input1"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>

              <div className="form-group1">
                <label htmlFor="last-name" className="form-label">
                  Last Name
                </label>
                <input
                  id="last-name"
                  className="form-input1"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="form-group1">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                className="form-input1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>

            <div className="form-group1">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                id="phone"
                className="form-input1"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                required
              />
            </div>

            <div className="form-group1">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input-container">
                <input
                  id="password"
                  className="form-input1"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-button">
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22M9.9 4.24A9.12 9.12 0 0 0 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group1">
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>
              <div className="password-input-container">
                <input
                  id="confirm-password"
                  className="form-input1"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle-button"
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22M9.9 4.24A9.12 9.12 0 0 0 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="terms-agreement-sp">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="checkbox"
                required
              />
              <label htmlFor="agree-terms" className="checkbox-label">
                I agree to the{" "}
                <a href="#" className="terms-link">
                  Terms & Conditions
                </a>
              </label>
            </div>

            {error && (
              <div
                className="error-message"
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

            {success && (
              <div
                className="success-message"
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

            <button type="submit" className="signup-button-sp" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
              {!isLoading && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="arrow-icon"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div className="divider"></div>

            <div className="support-text">
              Already have an account?{" "}
              <Link to="/login" className="support-link">
                Log In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
