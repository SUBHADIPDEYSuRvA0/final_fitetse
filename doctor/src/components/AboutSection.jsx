import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section">
  <div className="about-container">
    <div className="about-image">
      <img src="/workout.svg" alt="Health Consultation" />
    </div>
    <div className="about-content">
      <h4 className="about-subtitle">OUR MISSION</h4>
      <h2 className="about-title">
        Promoting Health Through Personalized Nutrition.
      </h2>
      <p className="about-description">
        We are committed to helping individuals achieve optimal health through balanced, evidence-based nutrition. Our goal is to provide personalized dietary advice that supports long-term well-being, enhances energy, and prevents chronic conditions. Together, we aim to create a healthier future, one meal at a time.
      </p>
      <button className="about-button">Start Your Journey</button>
    </div>
  </div>
</section>

  );
};

export default AboutSection;
