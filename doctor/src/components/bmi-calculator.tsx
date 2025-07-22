"use client"

import { useState, useEffect } from "react"
import "./bmi-calculator.css" // Import the CSS file for styling

const BMICalculator = () => {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [bmi, setBmi] = useState(0)
  const [bmiCategory, setBmiCategory] = useState("")
  const [hasCalculated, setHasCalculated] = useState(false)
  const [needleRotation, setNeedleRotation] = useState(-90)

  const calculateBMI = () => {
    if (!height || !weight) return

    // Convert height from cm to meters
    const heightInMeters = Number.parseFloat(height) / 100
    const weightInKg = Number.parseFloat(weight)

    // Calculate BMI: weight (kg) / (height (m))^2
    const calculatedBMI = weightInKg / (heightInMeters * heightInMeters)
    setBmi(Number.parseFloat(calculatedBMI.toFixed(1)))
    setHasCalculated(true)
  }

  // Determine BMI category and set needle position
  useEffect(() => {
    if (!hasCalculated) return

    // Determine BMI category
    let category = ""
    let color = ""
    let rotation = 0

    if (bmi < 18.5) {
      category = "Underweight"
      color = "#3498db" // Blue
      rotation = -72 + (bmi / 18.5) * 36 // Map 0-18.5 to -72 to -36 degrees
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal"
      color = "#2ecc71" // Green
      rotation = -36 + ((bmi - 18.5) / 6.5) * 36 // Map 18.5-25 to -36 to 0 degrees
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight"
      color = "#f1c40f" // Yellow
      rotation = ((bmi - 25) / 5) * 36 // Map 25-30 to 0 to 36 degrees
    } else if (bmi >= 30 && bmi < 35) {
      category = "Obese"
      color = "#e67e22" // Orange
      rotation = 36 + ((bmi - 30) / 5) * 36 // Map 30-35 to 36 to 72 degrees
    } else {
      category = "Morbidly Obese"
      color = "#e74c3c" // Red
      rotation = 72 + Math.min(((bmi - 35) / 5) * 18, 18) // Map 35+ to 72 to 90 degrees, cap at 90
    }

    setBmiCategory(category)
    setNeedleRotation(rotation)
    document.documentElement.style.setProperty("--bmi-category-color", color)
  }, [bmi, hasCalculated])

  const handleSubmit = (e) => {
    e.preventDefault()
    calculateBMI()
  }

  const resetForm = () => {
    setHeight("")
    setWeight("")
    setBmi(0)
    setBmiCategory("")
    setHasCalculated(false)
    setNeedleRotation(-90)
  }

  // Triangular needle component
  const TriangleNeedle = () => (
    <div className="bmi-needle-triangle" style={{ transform: `rotate(${needleRotation}deg)` }}>
      <svg width="20" height="120" viewBox="0 0 20 120" className="needle-svg">
        <polygon points="10,5 15,115 5,115" fill="#ff8c42" stroke="#e6753a" strokeWidth="1" />
        <circle cx="10" cy="115" r="8" fill="#ff8c42" stroke="#e6753a" strokeWidth="1" />
      </svg>
    </div>
  )

  return (
    <div className="bmi-calculator">
      <div className="bmi-header">
        {/* <div className="logo-container">
          <div className="logo-circle">
            <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M30 10C18.954 10 10 18.954 10 30C10 41.046 18.954 50 30 50C41.046 50 50 41.046 50 30C50 18.954 41.046 10 30 10ZM30 15C33.978 15 37.587 16.7071 40.1005 19.3995C40.5693 19.8683 40.5693 20.6317 40.1005 21.1005C39.6317 21.5693 38.8683 21.5693 38.3995 21.1005C36.413 19.114 33.8261 18 31 18C25.4772 18 21 22.4772 21 28C21 33.5228 25.4772 38 31 38C33.8261 38 36.413 36.886 38.3995 34.8995C38.8683 34.4307 39.6317 34.4307 40.1005 34.8995C40.5693 35.3683 40.5693 36.1317 40.1005 36.6005C37.587 39.2929 33.978 41 30 41C23.3726 41 18 35.6274 18 29C18 22.3726 23.3726 17 30 17C36.6274 17 42 22.3726 42 29C42 29.5523 41.5523 30 41 30C40.4477 30 40 29.5523 40 29C40 23.4772 35.5228 19 30 19C24.4772 19 20 23.4772 20 29C20 34.5228 24.4772 39 30 39C35.5228 39 40 34.5228 40 29C40 28.4477 40.4477 28 41 28C41.5523 28 42 28.4477 42 29C42 35.6274 36.6274 41 30 41C23.3726 41 18 35.6274 18 29C18 22.3726 23.3726 17 30 17Z"
                fill="white"
              />
            </svg>
          </div>
          <h1>FITETSE</h1>
        </div> */}
        <h2>
          Calculate Your <span className="highlight02">BMI</span>
        </h2>
      </div>

      <div className="bmi-content">
        <div className="bmi-form-container">
          <form onSubmit={handleSubmit} className="bmi-form">
            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 175"
                min="50"
                max="250"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 70"
                min="20"
                max="300"
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="calculate-btn">
                Calculate BMI
              </button>
              <button type="button" onClick={resetForm} className="reset-btn">
                Reset
              </button>
            </div>
          </form>
          {hasCalculated && (
            <div className="bmi-result">
              <h3>Your BMI Result</h3>
              <div className="bmi-value">{bmi}</div>
              <div className="bmi-category">{bmiCategory}</div>
            </div>
          )}
        </div>

        <div className="bmi-meter-container">
          <div className="bmi-meter">
            <div className="bmi-scale">
              <div className="bmi-segment underweight">
                <span className="segment-value">&lt; 18.5</span>
              </div>
              <div className="bmi-segment normal">
                <span className="segment-value">18.5 - 24.9</span>
              </div>
              <div className="bmi-segment overweight">
                <span className="segment-value">25.0 - 29.9</span>
              </div>
              <div className="bmi-segment obese">
                <span className="segment-value">30.0 - 34.9</span>
              </div>
              <div className="bmi-segment morbidly-obese">
                <span className="segment-value">&gt; 35.0</span>
              </div>
            </div>
            <div className="bmi-needle-container">
              <TriangleNeedle />
              <div className="bmi-needle-center"></div>
            </div>
          </div>
          {/* Labels positioned outside the meter */}
          <div className="bmi-labels-container">
            <div className="bmi-label label-underweight">UNDER WEIGHT</div>
            <div className="bmi-label label-normal">NORMAL</div>
            <div className="bmi-label label-overweight">OVERWEIGHT</div>
            <div className="bmi-label label-obese">OBESE</div>
            <div className="bmi-label label-morbidly">MORBIDLY OBESE</div>
          </div>
          <div className="bmi-meter-title">BODY MASS INDEX (BMI)</div>
        </div>
      </div>

      <div className="bmi-info">
        <h3>BMI Categories:</h3>
        <ul>
          <li>
            <span className="info-color underweight"></span> Underweight: BMI less than 18.5
          </li>
          <li>
            <span className="info-color normal"></span> Normal weight: BMI 18.5 to 24.9
          </li>
          <li>
            <span className="info-color overweight"></span> Overweight: BMI 25 to 29.9
          </li>
          <li>
            <span className="info-color obese"></span> Obesity: BMI 30 to 34.9
          </li>
          <li>
            <span className="info-color morbidly-obese"></span> Morbid Obesity: BMI 35 or greater
          </li>
        </ul>
        <p className="bmi-disclaimer">
          Note: BMI is a screening tool, not a diagnostic tool. Consult with a healthcare provider for a complete health
          assessment.
        </p>
      </div>
    </div>
  )
}

export default BMICalculator
