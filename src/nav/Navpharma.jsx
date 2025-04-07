import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Healthmate.png";

export default function Navpharma() {
  // Move this inside a try/catch to handle potential errors

    const user = JSON.parse(localStorage.getItem("user"));
 
  const navigate = useNavigate();

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login"); 
  };

 
  return (
    <>
      <div>
        <header className="header">
          <a href="#" className="logo">
            <img src={logo} alt="logo" className="logo" />
          </a>
          <nav className="headbar">
            <Link to={`/pharmacy/${user.pharmacy_id}`}>Home</Link>
            <Link to="/pharmacy/us">About Us</Link>
            <Link to={`/pharmacy/${user.pharmacy_id}/stock`}>View Stock</Link>
            <Link to="/pharmacy/Add">Add Med</Link>
            <button onClick={logout}>Logout</button>
          </nav>
        </header>
      </div>
    </>
  );
}