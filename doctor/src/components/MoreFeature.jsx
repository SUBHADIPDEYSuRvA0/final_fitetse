import React from 'react'
import { motion } from 'framer-motion'
import { FaDumbbell, FaAppleAlt, FaVideo, FaUserMd, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { MdSupportAgent, MdOutlineHealthAndSafety } from 'react-icons/md';
import { IoFitnessSharp } from 'react-icons/io5';

const MoreFeature = () => {
  return (
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
  )
}

export default MoreFeature