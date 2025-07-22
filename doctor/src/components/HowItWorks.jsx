import React from "react";
import Lottie from "react-lottie";
import animationData from "../assets/anime.json"; 
import "./HowItWorks.css"; // Import the CSS file for styling

const HowItWorks = () => {
  // Lottie options (you can adjust these based on your animation)
  const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData, 
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="steps-container">
        <div className="step">
          <div className="step-icon">
            <Lottie options={defaultOptions} height={150} width={150} />
          </div>
          <h3>Step 1: Choose Your Consultation</h3>
          <p>Fill in your details to select the type of consultation.</p>
        </div>

        <div className="step">
          <div className="step-icon">
            <Lottie options={defaultOptions} height={150} width={150} />
          </div>
          <h3>Step 2: Pick a Convenient Time Slot</h3>
          <p>Choose an available date and time for your consultation.</p>
        </div>

        <div className="step">
          <div className="step-icon">
            <Lottie options={defaultOptions} height={150} width={150} />
          </div>
          <h3>Step 3: Confirm Your Booking</h3>
          <p>Review and confirm your booking. You'll receive a confirmation email.</p>
        </div>

        <div className="step">
          <div className="step-icon">
            <Lottie options={defaultOptions} height={150} width={150} />
          </div>
          <h3>Step 4: Consultation Day</h3>
          <p>Meet your doctor and get expert advice.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
