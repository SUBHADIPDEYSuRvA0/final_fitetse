import React from 'react'
import Navbar from '../components/Navbar'
import Abouthero from '../components/Abouthero'
import AboutUs from '../components/AboutUs'
import FaqSection from '../components/FAQSection'
import BenefitsSection from '../components/BenefitsSection'
import Howsection from '../components/Howsection'
import FooterSection from '../components/FooterSection'
import DietitianPanel from '../components/DietitianPanel'
import TimelineSection from '../components/TimelineSection'
import ConsultationForm from '../components/ConsultationForm'
import MoreFeature from '../components/MoreFeature'
// import AboutUs2 from '../components/AboutUs2';

const About = () => {
  return (
    <div>
        <Navbar></Navbar>
        {/* <Abouthero></Abouthero> */}
        <AboutUs></AboutUs>
        {/* <AboutUs2></AboutUs2> */}
        <MoreFeature></MoreFeature>
        <Howsection></Howsection>
        <TimelineSection></TimelineSection>
        {/* <BenefitsSection></BenefitsSection> */}
        <FaqSection></FaqSection>
        <DietitianPanel></DietitianPanel>
        <div id="consultation-form">
          <ConsultationForm />
        </div>
        <FooterSection></FooterSection>
    </div>
  )
}

export default About