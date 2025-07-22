// Counter.jsx
import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import "./Counter.css"; // Import the CSS file

const Counter = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div className="counter-section" ref={ref}>
      <h2 className="counter-heading">Why Fitetse?</h2>
      <div className="counter-grid">
        
        <div className="counter-item">
          <div className="counter-number">
            {inView && <CountUp end={15} duration={2} />}+
          </div>
          <div className="counter-label">Specialities Doctors</div>
        </div>

        <div className="counter-item">
          <div className="counter-number">
            {inView && <CountUp end={8} duration={2} />}+ yrs
          </div>
          <div className="counter-label">
            Experience of <br /> most Doctors
          </div>
        </div>

        <div className="counter-item">
          <div className="counter-number">
            {inView && <CountUp end={100} duration={2} />}+
          </div>
          <div className="counter-label">Happy Clients</div>
        </div>

        {/* <div className="counter-item">
          <div className="counter-number">
            {inView && <CountUp end={4.6} decimals={1} duration={2} />}+
          </div>
          <div className="counter-label">Google Rating</div>
        </div> */}

        <div className="counter-item">
          <div className="counter-number">
            
            <span role="img" aria-label="certified">🛡️</span>
          </div>
          <div className="counter-label">
            HIPAA & ISO 27001 <br /> Certified
          </div>
        </div>

      </div>
    </div>
  );
};

export default Counter;
