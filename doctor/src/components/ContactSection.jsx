import React from 'react';
import './ContactSection.css'; // Import the CSS file
import Lottie from 'lottie-react';
import animationData from '../assets/cc.json';

const ContactSection = () => {
  return (
    <section className="contact-section">
      <div className="contact-left">
        <h2>
          Feel free to <span className="highlight">get in touch</span> with us.
        </h2>
        <p>
          Have questions about our courses, mentorship programs, or career guidance? 
          We're here to help! Fill out the form and our team will get back to you shortly.
        </p>
        <form className="contact-form">
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Your Email Address" />
          <input type="text" placeholder="Subject" />
          <input type="text" placeholder="Phone No" />
          <textarea placeholder="Your Message Here" rows="4"></textarea>
          <button type="submit">Send</button>
        </form>
      </div>

      <div className="contact-right">
        {/* <img src="/contact.svg" alt="Contact Illustration" /> */}
        <Lottie
      animationData={animationData}
      loop={true}
      
    />
      </div>
    </section>
  );
};

export default ContactSection;
