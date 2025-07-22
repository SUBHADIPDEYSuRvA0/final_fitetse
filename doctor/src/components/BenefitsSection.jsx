import React from 'react';
import { FaUserMd, FaClinicMedical, FaShieldAlt, FaHandPointer, FaRegClipboard } from 'react-icons/fa';
import './BenefitsSection.css';

const benefitsData = [
  {
    icon: <FaUserMd size={50} color="#077554" />,
    title: "Consult Top Dietitians & Fitness Coaches",
    description: "Connect instantly with our expert dietitians specializing in weight management and nutrition.",
  },
  {
    icon: <FaClinicMedical size={50} color="#077554" />,
    title: "Clinic-like Experience",
    description: "Enjoy a smooth online consultation experience from the comfort of your home.",
  },
  {
    icon: <FaShieldAlt size={50} color="#077554" />,
    title: "100% Confidential",
    description: "Your consultation is private, secure, and handled with the utmost care.",
  },
  {
    icon: <FaHandPointer size={50} color="#077554" />,
    title: "Personalized & Efficient",
    description: "Schedule your fitness sessions effortlessly, tailored to your goals and timing.",
  },
  
  {
    icon: <FaRegClipboard size={50} color="#077554" />,
    title: "Personalized Follow-up",
    description: "Receive customized diet plans and free follow-ups for better results.",
  },
  
];

const BenefitsSection = () => {
  return (
    <section className="benefits-section">
      <div className="benefits-content">
        <div className="benefits-header">
          <h2>Benefits of Online Consultation</h2>
          {/* <p>100 years of establishment in Ayurveda and having experienced expert Ayurvedic Doctors (below benefits of online consultation)</p> */}
        </div>
        <div className="benefits-cards">
          {benefitsData.map((benefit, index) => (
            <div className="benefit-card" key={index}>
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
