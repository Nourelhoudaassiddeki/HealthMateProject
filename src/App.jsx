import React, { useState, useEffect,useParams } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ScientificFormulation from '../public/research/ScientificFormulation';
import QualityTesting from '../public/research/QualityTesting';
import TransparentLabeling from '../public/research/TransparentLabeling';
import Payment from './pharmacies/Payment.jsx';
import './App.css';
import Nav from "./nav/Nav";
import Navpharma from "./nav/Navpharma.jsx";
import Para from "./pharmacies/Para";
import DialysisCenter from "./pharmacies/DialysisCenter.jsx";
import Login from './Login/Login';
import Footer from './footer/Footer.jsx';
import ChatApp from './chat/ChatApp.jsx';

import PharmaEssaouira from './availablepharma/pharmaessaouira';
import HealthcareBanner from './availablepharma/HealthcareBanner.jsx';
import MedicineDetails from "./availablepharma/Medicine_Details";
import AddMedicine from "./availablepharma/AddMedicine";
import Homie from "./Homie.jsx";
import About from './pharmacies/About';
import Contact from './pharmacies/Contact';
import SuccesPage from './pharmacies/SuccesPage.jsx';
import PharmacyMedicineStock from './pharmacies/PharmaMedicineStock.jsx';
import Aboutpharma from './availablepharma/Aboutpharma';
import Product from './Pharmacies/Product.jsx';
import Shop from './pharmacies/Shop';
const App = () => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on first render
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    // Save cart to localStorage whenever it updates
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (medicine) => {
    setCartItems((prevCart) => [...prevCart, medicine]);
  };
 
  
  return (
    <Router>
      <div className="app-container">
        {/* Conditionally render Navpharma or Nav based on the route */}
        {window.location.pathname.startsWith("/pharmacy/") ? <Navpharma /> : <Nav />}
        
       
        <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/pharmacies" element={<Para />} />
  <Route path="/dyalise" element={<DialysisCenter />} />
  <Route path="/about-us" element={<About />} />
  <Route path="/success" element={<SuccesPage   phoneNumber="+212 681423135" />} />
  <Route path="/contact-us" element={<Contact />} />
  <Route path="/pharmacy/:pharmacyId/stock" element={<PharmacyMedicineStock />} />
  <Route path="/products" element={<Product />} />
  <Route path="/payment" element={<Payment />} />
  <Route path="/shop" element={<Shop/>} />
  <Route path="/pharmacy/us" element={<Aboutpharma />} />
  <Route path="/pharmacy/add" element={<AddMedicine />} />
  {/* The dynamic route comes AFTER all specific routes */}
  <Route path="/pharmacy/:id" element={<PharmacyPage />} />
  <Route path="/medicine/:id" element={<MedicineDetails addToCart={addToCart} />} />
  <Route path="/" element={<> <Homie/> <ChatApp/> </>} />
  <Route path="/research/ScientificFormulation" element={<ScientificFormulation />} />
        <Route path="/research/QualityTesting" element={<QualityTesting />} />
        <Route path="/research/TransparentLabeling" element={<TransparentLabeling />} />
</Routes>
        <Footer />
      </div>
    </Router>
  );
};

// The new PharmacyPage component to handle user redirection if not logged in
const PharmacyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
    } else if (user.role === 'pharmacy') { // assuming the user object has a 'role' property
      const pharmacyId = user.pharmacyId; // assuming the pharmacy ID is stored in the user object
      if (pharmacyId) {
        navigate(`/pharmacy/${pharmacyId}`);
      }
    }
  }, [navigate]);

  return (
    <>
      <HealthcareBanner />
      <Navpharma />
      <PharmaEssaouira />
    </>
  );
};

export default App;

