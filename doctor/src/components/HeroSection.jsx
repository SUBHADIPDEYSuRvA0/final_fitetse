import React from "react";
import "./HeroSection.css";
import WaveBackground from "../assets/wave2.svg";
import HealthSVG from "../assets/about-image.svg";

const HeroSection = () => {
  const handleScrollToForm = () => {
    const target = document.getElementById("consultation-form");

    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // Adjust for smoother/slower scroll
      let startTime = null;

      const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      };

      const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      };

      requestAnimationFrame(animation);
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Your Health Journey Starts Here</h1>
          <p>Book your appointment and start your healthy life journey today!</p>
          <button className="cta-button" onClick={handleScrollToForm}>
            Book Your Appointment
          </button>
        </div>
        <div className="hero-image">
          <img src={HealthSVG} alt="Health Illustration" />
        </div>
      </div>
      <img src={WaveBackground} alt="Wave background" className="wave-background" />
    </section>
  );
};

export default HeroSection;
