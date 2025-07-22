import { useState } from "react";
import "./Navbar.css";
import logo from "../assets/fitetse.jpg";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Fitsaha" className="logo" />
        </Link>
      </div>

      <div className={`navbar-center ${menuOpen ? "open" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/login" style={{textDecoration: "none"}}>
          <button className="login-btn">SIGNUP</button>
        </Link>
        <Link to="/login" style={{textDecoration: "none"}}>
          <button className="login-btn" >
            LOGIN</button>
        </Link>
      </div>
      

        {/* Hamburger Icon */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`bar ${menuOpen ? "open" : ""}`}></div>
          <div className={`bar ${menuOpen ? "open" : ""}`}></div>
          <div className={`bar ${menuOpen ? "open" : ""}`}></div>
        </div>
      

    </nav>
  );
};

export default Navbar;
