import React from 'react'
import ContactSection from '../components/ContactSection'
import Navbar from '../components/Navbar'
import FooterSection from '../components/FooterSection'
import BMICalculator from '../components/bmi-calculator'
const Contact = () => {
  return (
    <div>
        <Navbar></Navbar>
        <ContactSection></ContactSection>
        
        <FooterSection></FooterSection>
    </div>
  )
}

export default Contact