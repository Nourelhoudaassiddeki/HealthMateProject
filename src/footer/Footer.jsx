import React from 'react';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import '../assets/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <div className="footer-container">
        {/* Logo */}
        <div className="footer-logo">
          <img 
            src="/image.jpg" 
            alt="Betterhealth" 
          />
        </div>
        
        {/* Footer Content */}
        <div className="footer-columns">
          {/* Explore Column */}
          <div className="footer-column">
            <h3>Explore</h3>
            <ul>
              <li><a href="/shop">Shop All</a></li>
              <li><a href="/shop/probiotic">Payment</a></li>
              <li><a href="/shop/vitamins">Returns</a></li>
            </ul>
          </div>
          
          {/* Customer Support Column */}
          <div className="footer-column">
            <h3>Customer Support</h3>
            <ul>
              <li><a href="/delivery-returns">Delivery </a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/us">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Info Column */}
          <div className="footer-column">
            <h3>Info</h3>
            <ul>
             
              <li><a href="/about">About Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        
        {/* Social and Copyright */}
        <div className="footer-bottom">
          <h3 className="footer-company">
           HealthMate Morocco is an Moroccan company registered in Essaouira, Merrakech
          </h3>
          
          <div className="footer-right">
            <div className="social-icons">
              <a href="https://instagram.com/bettervits" className="social-icon">
                <FaInstagram size={20} />
              </a>
              <a href="https://facebook.com/bettervits" className="social-icon">
                <FaFacebook size={20} />
              </a>
            </div>
            <h3 className="copyright">
              Copyright © HealthMate {currentYear}. All rights reserved.
            </h3>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
