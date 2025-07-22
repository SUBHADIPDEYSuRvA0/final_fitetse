import { useState } from "react";
import "./FAQSection.css";


  const faqData = [
    {
      question: "What is the role of a medical dietitian?",
      answer: "Medical dietitians provide personalized nutrition advice to help manage chronic diseases, improve recovery, and promote overall health."
    },
    {
      question: "How can a dietitian help with weight management?",
      answer: "Dietitians create customized meal plans and guide sustainable habits to help you reach and maintain a healthy weight safely."
    },
    
    {
      question: "Can dietitians help with diabetes or heart disease?",
      answer: "Absolutely! Dietitians specialize in creating nutrition plans tailored to manage and even reverse chronic conditions like diabetes and heart disease."
    },
    
    {
      question: "What does a fitness coach help with?",
      answer: "A fitness coach provides guidance on exercise routines, proper techniques, and motivation to help you reach your physical health goals safely."
    },
    {
      question: "How can a fitness coach help improve my workout routine?",
      answer: "A fitness coach evaluates your current routine, corrects form, introduces variety, and ensures you're training efficiently to avoid plateaus and injuries."
    },
  ];
  
export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <>
      {/* <div className="faq-wave-top">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none">
          <path d="M-0.27,56.97 C149.99,150.00 271.76,-49.98 502.54,116.09 L500.00,0.00 L0.00,0.00 Z" style={{ stroke: "none", fill: "#0b3d2e" }}></path>
        </svg>
      </div> */}
    <section className="faq-section">
     
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                {faq.question}
                <span className={`faq-icon ${activeIndex === index ? "rotate" : ""}`}>
                  {activeIndex === index ? "-" : "+"}
                </span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
