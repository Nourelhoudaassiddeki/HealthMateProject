import React from 'react'
import { Link , useNavigate } from "react-router-dom";
import logo from "../assets/Healthmate.png"; 
export default  function Nav () {
  const navigate = useNavigate();

  // Logout function
  const logout = () => {
    localStorage.removeItem("user"); // Remove user data from localStorage
    navigate("/login"); // Redirect to the login page
  };
  return (
    <>
    <div>
    <header className="header">
      <a href="#" className="logo">
        <img src={logo} alt="logo" className="logo" />
      </a>
      <nav className="headbar">
        <Link to="/">Home</Link>
        <Link to="/pharmacies">Pharma Duty</Link>
        <Link to="/dyalise">Dyalisis Center</Link>
        <Link to="/products">Product</Link>
        <Link to="/about-us">About Us</Link>
        <Link to="/contact-us">Contact Us</Link>
        <Link to="/login">⎆</Link>
        <Link to="/shop">🛒</Link>
        <button onClick={logout}>Logout</button>
      </nav>
    </header>
    </div>
    </> 
    )

}
