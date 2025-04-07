import React from "react";
import logo from '/image.png'; 
import './HealthcareBanner.css';
const HealthcareBanner = () => {
  return (
    <div className="relative w-full">
      {/* Background Image Layer */}
      <div 
        className="absolute top-0 left-0 w-full h-[300px] md:h-[400px] bg-cover bg-center" 
        style={{ backgroundImage: `url(${logo})` }}
      ></div>

      {/* Main Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center px-8 md:px-16">
        {/* Semi-transparent Overlay */}
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
        
        {/* Content Box */}
        <div className="a">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight text-green-900">
          Your Trusted Partner for a Healthier Life!
          </h2>
          <p className="mt-4 text-base md:text-lg font-medium">
          Your health, your way—HealthMate helps you find nearby pharmacies and dialysis centers effortlessly. Whether it's quick access to medication or essential care, we’re here to connect you to trusted services, anytime, anywhere
          </p>
        </div>
      </section>
    </div>
  );
};

export default HealthcareBanner;


