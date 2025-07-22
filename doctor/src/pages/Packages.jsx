import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaAppleAlt, FaVideo, FaUserMd, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { MdSupportAgent, MdOutlineHealthAndSafety } from 'react-icons/md';
import { IoFitnessSharp } from 'react-icons/io5';
import './Packages.css';
import Navbar from '../components/Navbar';
import FooterSection from '../components/FooterSection';
import FaqSection from '../components/FAQSection';

const Packages = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleGetStarted = (packageType) => {
    setSelectedPackage(packageType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="packages-container">
        <Navbar></Navbar>
      <div className="packages-hero">
        {/* <div className="wave-top">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L80,112C160,128,320,160,480,154.7C640,149,800,107,960,90.7C1120,75,1280,85,1360,90.7L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
          </svg>
        </div> */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="packages-title"
        >
          Choose Your Fitness Journey
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="packages-subtitle"
        >
          Personalized plans designed by experts to help you achieve your health goals
        </motion.p>
      </div>

      <div className="pricing-toggle">
        <h2>Plans</h2>
        {/* <span className={selectedPlan === 'monthly' ? 'active' : ''}>Monthly</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={selectedPlan === 'quarterly'} 
            onChange={() => setSelectedPlan(selectedPlan === 'monthly' ? 'quarterly' : 'monthly')}
          />
          <span className="slider round"></span>
        </label>
        <span className={selectedPlan === 'quarterly' ? 'active' : ''}>Quarterly</span>
        <div className="save-badge">Save 33%</div> */}
      </div>

      <div className="packages-grid">
        <motion.div 
          className="package-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -10, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
        >
          <div className="package-header">
            <h2>Essential Plan</h2>
            <div className="package-price">
              {selectedPlan === 'monthly' ? (
                <>
                  <span className="price">$750</span>
                  <span className="period">/ month</span>
                </>
              ) : (
                <>
                  <span className="price">$1500</span>
                  <span className="period">/ 3 months</span>
                </>
              )}
            </div>
            <p className="package-description">
              Perfect for beginners looking to start their fitness journey with professional guidance
            </p>
          </div>
          <div className="package-features">
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Personalized diet plan from certified dietitians</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>3 live online fitness classes per week</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Weekly progress tracking</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Access to recipe database</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Email support</span>
            </div>
            <div className="feature">
              {/* <FaRegCircle className="feature-icon" /> */}
              <FaCheckCircle className="feature-icon" />
              <span>Online coaching sessions</span>
            </div>
            <div className="feature">
            <FaCheckCircle className="feature-icon" />
              <span>Advanced fitness assessments</span>
            </div>
          </div>
          <button 
            className="package-button"
            
          >
            Get Started
          </button>
        </motion.div>

        <motion.div 
          className="package-card premium"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -10, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
        >
          <div className="popular-badge">Most Popular</div>
          <div className="package-header">
            <h2>Premium Plan</h2>
            <div className="package-price">
              {selectedPlan === 'monthly' ? (
                <>
                  <span className="price">$1500</span>
                  <span className="period">/ 3 month</span>
                </>
              ) : (
                <>
                  <span className="price">$3000</span>
                  <span className="period">/ 3 months</span>
                </>
              )}
            </div>
            <p className="package-description">
              Comprehensive program for those serious about transforming their health and fitness
            </p>
          </div>
          <div className="package-features">
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Personalized diet plan from certified dietitians</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>3 live online fitness classes per week</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Weekly progress tracking</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Access to recipe database</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Email support</span>
            </div>
            <div className="feature">
              {/* <FaRegCircle className="feature-icon" /> */}
              <FaCheckCircle className="feature-icon" />
              <span>Online coaching sessions</span>
            </div>
            <div className="feature">
            <FaCheckCircle className="feature-icon" />
              <span>Advanced fitness assessments</span>
            </div>
          </div>
          <button 
            className="package-button premium-button"
            
          >
            Get Started
          </button>
        </motion.div>
      </div>

      <div className="more-section">
        <h2>What's Included in Your Fitness Journey</h2>
        <div className="features-grid">
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-container">
              <FaUserMd />
            </div>
            <h3>Expert Dietitians</h3>
            <p>Our certified dietitians create personalized meal plans based on your specific needs, preferences, and health goals.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-container">
              <IoFitnessSharp />
            </div>
            <h3>Professional Coaches</h3>
            <p>Our experienced fitness coaches guide you through effective workouts designed to maximize results and prevent injuries.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-container">
              <FaVideo />
            </div>
            <h3>Live Online Classes</h3>
            <p>Join interactive fitness sessions from the comfort of your home, with real-time feedback from our expert coaches.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-container">
              <FaAppleAlt />
            </div>
            <h3>Nutrition Guidance</h3>
            <p>Learn how to make healthier food choices with our comprehensive nutrition education and personalized advice.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-container">
              <FaDumbbell />
            </div>
            <h3>Custom Workouts</h3>
            <p>Receive tailored exercise routines that fit your fitness level, available equipment, and specific goals.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon-container">
              <MdSupportAgent />
            </div>
            <h3>Ongoing Support</h3>
            <p>Get continuous motivation and assistance throughout your fitness journey with our dedicated support team.</p>
          </motion.div>
        </div>
      </div>

      {/* <div className="testimonials-section">
        <h2>Success Stories</h2>
        <div className="testimonials-grid">
          <motion.div 
            className="testimonial-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="testimonial-content">
              <p>"FITETSE transformed my approach to fitness and nutrition. The personalized diet plan and regular online sessions helped me lose 30 pounds in just 3 months!"</p>
              <div className="testimonial-author">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah J." />
                <div>
                  <h4>Sarah J.</h4>
                  <span>Lost 30 lbs in 3 months</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="testimonial-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="testimonial-content">
              <p>"As someone with a busy schedule, the flexibility of FITETSE's online classes was perfect. The coaches are knowledgeable and the diet plans are easy to follow. Highly recommend!"</p>
              <div className="testimonial-author">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael T." />
                <div>
                  <h4>Michael T.</h4>
                  <span>Gained muscle & improved energy</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="testimonial-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="testimonial-content">
              <p>"The personalized approach makes all the difference. My dietitian understood my dietary restrictions and created a plan that worked perfectly for me. I've never felt better!"</p>
              <div className="testimonial-author">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Lisa R." />
                <div>
                  <h4>Lisa R.</h4>
                  <span>Improved health markers</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div> */}

      {/* <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3>How often are the online fitness classes?</h3>
            <p>Our Essential Plan includes 3 live online classes per week, while the Premium Plan offers 5 classes weekly. Classes are scheduled at various times to accommodate different time zones and schedules.</p>
          </motion.div>

          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3>Can I switch plans after signing up?</h3>
            <p>Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, the new rate will apply at your next billing cycle.</p>
          </motion.div>

          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3>How personalized are the diet plans?</h3>
            <p>Our dietitians create fully customized plans based on your health goals, dietary preferences, allergies, and lifestyle. Plans are regularly adjusted based on your progress and feedback.</p>
          </motion.div>

          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3>What equipment do I need for the fitness classes?</h3>
            <p>Most classes require minimal equipment like resistance bands, light dumbbells, and a yoga mat. Our coaches provide modifications for all exercises based on available equipment.</p>
          </motion.div>

          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3>Is there a refund policy?</h3>
            <p>We offer a 7-day satisfaction guarantee. If you're not completely satisfied within the first week, contact us for a full refund. After this period, refunds are prorated based on unused time.</p>
          </motion.div>

          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3>Can I pause my subscription?</h3>
            <p>Yes, you can pause your subscription for up to 30 days once every 6 months. Your billing cycle will be adjusted accordingly when you resume.</p>
          </motion.div>
        </div>
      </div> */}



      <div className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          
      <FaqSection></FaqSection>
        </motion.div>
      </div>









      {/* <div className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Transform Your Health?</h2>
          <p>Join thousands of satisfied clients who have achieved their fitness goals with FITETSE</p>
          <button className="cta-button" onClick={() => handleGetStarted('essential')}>Start Your Journey Today</button>
        </motion.div>
      </div> */}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>Get Started with {selectedPackage === 'premium' ? 'Premium' : 'Essential'} Plan</h2>
            <p>Fill out the form below to begin your fitness journey with FITETSE.</p>
            
            <form className="signup-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="Enter your full name" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="Enter your email address" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="Enter your phone number" required />
              </div>
              
              <div className="form-group">
                <label htmlFor="goals">Your Fitness Goals</label>
                <textarea id="goals" placeholder="Tell us about your fitness goals" rows="3"></textarea>
              </div>
              
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
        </div>
      )}

      <div className="wave-bottom">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#07392F" fillOpacity="1" d="M0,96L80,112C160,128,320,160,480,154.7C640,149,800,107,960,90.7C1120,75,1280,85,1360,90.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>
      <FooterSection></FooterSection>
    </div>
  );
};

export default Packages;