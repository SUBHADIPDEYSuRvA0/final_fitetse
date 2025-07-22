import React from "react";
import { FaUserCheck, FaRegCalendarCheck, FaCreditCard, FaVial, FaCheckCircle,FaPhoneAlt } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import "./Howsection.css";

const Howsection = () => {
  const steps = [
    { icon: <FaRegCalendarCheck />, label: "Book" },
    { icon: <FaPhoneAlt />, label: "Consultation Call" },
    { icon: <FaUserCheck />, label: "Register" },
    { icon: <FaCreditCard />, label: "Pay" },
    { icon: <FaCheckCircle />, label: "Fitness journey Start" },
    
  ];

  return (
    <div className="how-it-works-container">
      <h2 className="how-it-works-title">How it Works</h2>
      <div className="steps-wrapper">
        {steps.map((step, index) => (
          <div className="step-item" key={index}>
            <div className="step-circle">
              <div className="step-icon-how">{step.icon}</div>
            </div>
            <p className="step-label">{step.label}</p>
            {index < steps.length - 1 && (
              <div className="step-arrow">
                <BsArrowRight />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Howsection;
