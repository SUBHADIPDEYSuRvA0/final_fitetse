import React from "react";
import { Link } from "react-router-dom"; // ✅ Import Link
import "./FooterSection.css";

const FooterSection = () => {
  return (
    <footer className="footer">
      <img src="/wwaves2.svg" alt="wave" />

      <div className="footer-wave">
        {/* You can re-enable the SVG if needed */}
      </div>

      <div className="footer-content">
        <div className="footer-section about">
          <h2>About Us</h2>
          <p>
            We connect dietitians with people who want to change their lives.
            Your health, our mission.
          </p>
        </div>

        <div className="footer-section links">
          <h2>Quick Links</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/packages">Packages</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h2>Contact Info</h2>
          <p>Email: support@fitetse.com</p>
          <p>Phone: +91 98765 43210</p>
          <div className="socials">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright &copy; 2025 Fitetse. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default FooterSection;
