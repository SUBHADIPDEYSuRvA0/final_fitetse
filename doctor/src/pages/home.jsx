import React from 'react';
import Navbar from '../components/Navbar';
import TimelineSection from '../components/TimelineSection';
import FooterSection from '../components/FooterSection';
import BenefitsSection from '../components/BenefitsSection';
import AboutSection from '../components/AboutSection';
import HeroSection from '../components/HeroSection';
import FAQSection from '../components/FAQSection';
import DietitianPanel from '../components/DietitianPanel';
import Counter from '../components/Counter';
import ConsultationForm from '../components/ConsultationForm';
import Howsection from '../components/howsection';
import BMICalculator from '../components/bmi-calculator'

import { motion } from 'framer-motion';






const Home = () => {
  return (
     <div>
           <Navbar></Navbar>
      <HeroSection></HeroSection>
      <AboutSection></AboutSection>
      <Counter></Counter>
      <BenefitsSection></BenefitsSection>
      


    
                
            
      <Howsection></Howsection>
              
      

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                
            
      
      <TimelineSection></TimelineSection>
              </motion.div>
      <FAQSection></FAQSection>
      <DietitianPanel></DietitianPanel>
      <BMICalculator></BMICalculator>
      <div id="consultation-form">
          <ConsultationForm />
        </div>
     

      <FooterSection></FooterSection>

         
        </div>
  )
}

export default Home