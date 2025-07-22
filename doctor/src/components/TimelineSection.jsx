import React from "react";
import "./TimelineSection.css";

const TimelineSection = () => {
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

  return (<div className="timeline-section">
     
      <div className="timeline-display">
        <img src="./yoga.svg" alt="yogo" />
        </div>
    <div className="timeline-container">
      <div className="timeline-line"></div>
      {steps.map((step, index) => (
        <div key={index} className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}>
          <div className="timeline-heart">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#f89d52"
    width="20px"
    height="20px"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3
             19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54
             L12 21.35z" />
  </svg>
</div>
          <div className="timeline-content">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
};

export default TimelineSection;
