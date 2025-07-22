import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  const handleGetStarted = () => {
    const target = document.getElementById("consultation-form");

    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // duration in ms (1000ms = slower scroll)
      let startTime = null;

      const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
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
    <section className="about-container1">
      <div className="about-text-box1">
        <span className="about-tag1">About Fitetse</span>
        <h2 className="about-heading1">
          Advancing health<br />
          with accessible<br />
          wellness
        </h2>
        <p className="about-description1">
          Achieve your wellness goals with tailored fitness programs and expert dietary guidance <br />
          designed to support a healthier lifestyle.
        </p>
        <div className="about-buttons1">
          <button className="btn-primary1" onClick={handleGetStarted}>
            Get Started Today
          </button>
        </div>
      </div>
      <div className="about-image-box1">
        <img
          src="https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Wellness"
          className="about-image1"
        />
      </div>
    </section>
  );
};

export default AboutUs;
