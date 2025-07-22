import React from "react";
import "./StepsSection.css";

const steps = [
  {
    title: "Understanding",
    description:
      "Book a consultation with our experts for us to understand how we can help you build the perfect roadmap to your health goals.",
  },
  {
    title: "Customize",
    description:
      "Receive a carefully designed plan that is personalized to your needs and assimilates easily into your daily life.",
  },
  {
    title: "Daily tracking",
    description:
      "Check-in with your personal coach to monitor your progress and address any questions or concerns.",
  },
  {
    title: "Getting results",
    description:
      "Achieve holistic wellbeing that is long-lasting with small but powerful changes in your nutrition, eating habits and lifestyle.",
  },
];

const StepsSection = () => {
  return (
    <div className="steps-section">
      <div className="steps-line" />
      <div className="steps-content">
        {steps.map((step, index) => (
          <div className="step-item" key={index}>
            <div className="step-icon" />
            <div className="step-text">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsSection;
