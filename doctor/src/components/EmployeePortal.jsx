"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import "./Employeeportal.css"
import { Link } from "react-router-dom"

export default function EmployeePortal() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

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
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!password.trim()) {
      setError("Password is required")
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const loginData = {
        email: email.trim(),
        password: password,
      }

      console.log("Attempting login with:", { email: loginData.email })

      const response = await fetch("https://dashboard.fitetse.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`)
      }

      console.log("Login successful:", result)
      setSuccess("Login successful! Redirecting to dashboard...")

      // Store authentication data based on "Remember me" preference
      const storage = rememberMe ? localStorage : sessionStorage

      // Store tokens if provided by the API
      if (result.token) {
        storage.setItem("authToken", result.token)
      }
      if (result.refreshToken) {
        storage.setItem("refreshToken", result.refreshToken)
      }

      // Store user data if provided
      if (result.user) {
        storage.setItem("userData", JSON.stringify(result.user))
      }

      // Store login preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
      }

      // Clear form
      setEmail("")
      setPassword("")
      setRememberMe(false)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/" // or use your router navigation
      }, 1500)
    } catch (error) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Left side with animation */}
      <div className="login-left">
        <canvas ref={canvasRef} className="animation-canvas"></canvas>

        <div className="logo-container">{/* Logo content can be added here if needed */}</div>
      </div>

      {/* Right side with login form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h2 className="form-title">LOG IN</h2>
            <p className="form-subtitle">Enter your credentials to access your dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
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
                placeholder="Email"
                required
                disabled={isLoading}
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
                  placeholder="Password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-button"
                  disabled={isLoading}
                >
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

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="checkbox-label">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
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
              Don't have an account?{" "}
              <Link to="/signup" className="support-link">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
