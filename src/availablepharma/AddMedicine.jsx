import React, { useState, useEffect } from "react";
import "../assets/AddMedicine.css";

const AddMedicine = () => {
  const [medicineData, setMedicineData] = useState({
    name: "",
    composition: "",
    manufacturer: "",
    image_url: "",
    average_review: 0,
    excellent_review: 0,
    poor_review: 0,
    side_effects: "",
    uses: "",
    price: 0,
    quantity: 0,
    pharmacy_id: "",
  });
  
  const [isValidImage, setIsValidImage] = useState(true);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicineData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
    // Reset image validation when URL changes
    if (name === "image_url") {
      setIsValidImage(true);
    }
  };
  
  // Check if image URL is valid
  useEffect(() => {
    if (medicineData.image_url) {
      const img = new Image();
      img.onload = () => setIsValidImage(true);
      img.onerror = () => setIsValidImage(false);
      img.src = medicineData.image_url;
    }
  }, [medicineData.image_url]);

  // Calculate total percentage
  const totalReviewPercentage = 
    Number(medicineData.excellent_review) + 
    Number(medicineData.average_review) + 
    Number(medicineData.poor_review);

  // Handle form submission
  // Modify the handleSubmit function in your AddMedicine component
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate that pharmacy_id is provided
  if (!medicineData.pharmacy_id) {
    alert("Please enter a Pharmacy ID");
    return;
  }

  try {
    // Fetch existing medicines from the database
    const response = await fetch("http://localhost:5000/medicines");
    const medicines = await response.json();

    // Check if a medicine with the same name, manufacturer, and composition already exists
    const existingMedicine = medicines.find(
      (medicine) =>
        medicine.name === medicineData.name &&
        medicine.manufacturer === medicineData.manufacturer &&
        medicine.composition === medicineData.composition
    );

    let newId;
    if (existingMedicine) {
      // Use the existing medicine ID
      newId = existingMedicine.id;
      console.log("Using existing medicine ID:", newId);
    } else {
      // Find the highest ID and create a new one
      const highestId = medicines.reduce(
        (max, medicine) => Math.max(max, typeof medicine.id === 'string' ? parseInt(medicine.id) : medicine.id),
        0
      );
      newId = highestId + 1;
      console.log("Assigning new medicine ID:", newId);
    }

    // Prepare the data to submit for the medicine
    const medicineDataToSubmit = {
      id: String(newId), // Convert ID to string here
      name: medicineData.name,
      composition: medicineData.composition,
      manufacturer: medicineData.manufacturer,
      price: Number(medicineData.price),
      image_url: medicineData.image_url,
      uses: medicineData.uses,
      side_effects: medicineData.side_effects,
      excellent_review: Number(medicineData.excellent_review),
      average_review: Number(medicineData.average_review),
      poor_review: Number(medicineData.poor_review),
    };

    // Submit the medicine data (POST request)
    const response1 = await fetch("http://localhost:5000/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medicineDataToSubmit),
    });

    if (!response1.ok) {
      throw new Error("Failed to add medicine to the database");
    }

    const medicineResponse = await response1.json();
    console.log("Medicine added:", medicineResponse);

    // Now associate the medicine with the pharmacy
    const pharmacyMedicineData = {
      pharmacy_id: Number(medicineData.pharmacy_id),
      medicine_id: String(newId), // Also convert this ID to string
      quantity: Number(medicineData.quantity),
    };

    const response2 = await fetch("http://localhost:5000/pharmacy-medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pharmacyMedicineData),
    });

    if (!response2.ok) {
      throw new Error("Failed to associate medicine with the pharmacy");
    }

    console.log("Pharmacy medicine link created:", await response2.json());

    alert("Medicine added successfully!");

    // Clear the form
    setMedicineData({
      name: "",
      composition: "",
      manufacturer: "",
      price: "",
      quantity: "",
      image_url: "",
      uses: "",
      side_effects: "",
      excellent_review: 0,
      average_review: 0,
      poor_review: 0,
      pharmacy_id: "",
    });
  } catch (error) {
    console.error("Error:", error);
    alert("There was an error adding the medicine: " + error.message);
  }
};

  // Simple hash function to convert a string to an integer
  // This is a naive implementation and might produce collisions
  function hashStringToInt(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    // Make sure the hash is positive and not too large
    return Math.abs(hash) % 1000000;
  }

  // Create review curve points
  const createCurvePoints = () => {
    const reviews = [
      { type: 'poor', value: Number(medicineData.poor_review) },
      { type: 'average', value: Number(medicineData.average_review) },
      { type: 'excellent', value: Number(medicineData.excellent_review) }
    ];
    
    // Filter out reviews with 0 value
    const validReviews = reviews.filter(r => r.value > 0);
    
    // If no valid reviews, return empty path
    if (validReviews.length === 0) return "";
    
    // Canvas dimensions
    const width = 300;
    const height = 100;
    
    // Calculate positions
    const points = [];
    const segmentWidth = width / 2;
    
    validReviews.forEach((review, index) => {
      const x = (index / (validReviews.length - 1 || 1)) * width;
      // Use the review value as the height (inverted, since SVG y increases downward)
      const y = height - ((review.value / 100) * height);
      points.push({ x, y, type: review.type });
    });
    
    // Create the path
    if (points.length === 1) {
      // Just a circle if only one point
      return `M${points[0].x},${points[0].y} a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0`;
    }
    
    let path = `M${points[0].x},${points[0].y}`;
    
    // Create a curved path between points
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i].x + segmentWidth / 2;
      const y1 = points[i].y;
      const x2 = points[i + 1].x - segmentWidth / 2;
      const y2 = points[i + 1].y;
      
      path += ` C${x1},${y1} ${x2},${y2} ${points[i + 1].x},${points[i + 1].y}`;
    }
    
    return path;
  };

  return (
    <div className="add-medicine-container">
      <div className="add-medicine-card">
        <h2 className="card-header">Add Medicine</h2>
        
        <form onSubmit={handleSubmit} className="medicine-form">
          <div className="form-grid">
            {/* Left Column - Basic Information */}
            <div className="form-column basic-info">
              <h3 className="section-title">Basic Information</h3>

              <div className="form-group">
                <label htmlFor="pharmacy_id">Pharmacy ID:</label>
                <input
                  id="pharmacy_id"
                  type="number"
                  name="pharmacy_id"
                  value={medicineData.pharmacy_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={medicineData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="composition">Composition:</label>
                <input
                  id="composition"
                  type="text"
                  name="composition"
                  value={medicineData.composition}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="manufacturer">Manufacturer:</label>
                <input
                  id="manufacturer"
                  type="text"
                  name="manufacturer"
                  value={medicineData.manufacturer}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Price (MAD):</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={medicineData.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={medicineData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image_url">Image URL:</label>
                <input
                  id="image_url"
                  type="text"
                  name="image_url"
                  value={medicineData.image_url}
                  onChange={handleChange}
                  required
                  className={!isValidImage ? 'input-error' : ''}
                />
              </div>
              
              {/* Image Preview */}
              <div className="image-preview-container">
                {medicineData.image_url ? (
                  <>
                    <img 
                      src={medicineData.image_url} 
                      alt="Medicine preview" 
                      className="medicine-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150?text=Invalid+Image';
                        setIsValidImage(false);
                      }}
                    />
                    {!isValidImage && <div className="image-error">Invalid image URL</div>}
                  </>
                ) : (
                  <div className="no-image">
                    <span>Image Preview</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle Column - Detailed Information */}
            <div className="form-column detailed-info">
              <h3 className="section-title">Details</h3>
              <div className="form-group">
                <label htmlFor="uses">Uses:</label>
                <textarea
                  id="uses"
                  name="uses"
                  value={medicineData.uses}
                  onChange={handleChange}
                  required
                  rows="5"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="side_effects">Side Effects:</label>
                <textarea
                  id="side_effects"
                  name="side_effects"
                  value={medicineData.side_effects}
                  onChange={handleChange}
                  required
                  rows="5"
                />
              </div>
            </div>
            
            {/* Right Column - Review Data */}
            <div className="form-column review-data">
              <h3 className="section-title">Review Distribution</h3>
              <div className="review-inputs">
                <div className="form-group">
                  <label htmlFor="excellent_review">
                    <span className="color-dot excellent"></span>
                    Excellent Review (%):
                  </label>
                  <input
                    id="excellent_review"
                    type="number"
                    name="excellent_review"
                    value={medicineData.excellent_review}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="average_review">
                    <span className="color-dot average"></span>
                    Average Review (%):
                  </label>
                  <input
                    id="average_review"
                    type="number"
                    name="average_review"
                    value={medicineData.average_review}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="poor_review">
                    <span className="color-dot poor"></span>
                    Poor Review (%):
                  </label>
                  <input
                    id="poor_review"
                    type="number"
                    name="poor_review"
                    value={medicineData.poor_review}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                
                <div className={`total-percentage ${totalReviewPercentage !== 100 ? 'error' : ''}`}>
                  Total: {totalReviewPercentage}% {totalReviewPercentage !== 100 ? '(Must equal 100%)' : ''}
                </div>
              </div>
              
              {/* Review Graph */}
              <div className="review-graph-container">
                <svg width="100%" height="120" viewBox="0 0 300 100" className="review-curve">
                  {/* Grid lines */}
                  <line x1="0" y1="0" x2="300" y2="0" className="grid-line" />
                  <line x1="0" y1="25" x2="300" y2="25" className="grid-line" />
                  <line x1="0" y1="50" x2="300" y2="50" className="grid-line" />
                  <line x1="0" y1="75" x2="300" y2="75" className="grid-line" />
                  <line x1="0" y1="100" x2="300" y2="100" className="grid-line" />
                  
                  {/* X-axis labels */}
                  <text x="0" y="115" className="axis-label">Poor</text>
                  <text x="150" y="115" className="axis-label">Average</text>
                  <text x="280" y="115" className="axis-label">Excellent</text>
                  
                  {/* Y-axis labels */}
                  <text x="-25" y="100" className="axis-label">0%</text>
                  <text x="-25" y="50" className="axis-label">50%</text>
                  <text x="-25" y="10" className="axis-label">100%</text>
                  
                  {/* Review curve */}
                  <path 
                    d={createCurvePoints()} 
                    className="review-path" 
                    fill="none" 
                  />
                  
                  {/* Data points with color coding */}
                  {Number(medicineData.poor_review) > 0 && (
                    <circle 
                      cx="0" 
                      cy={100 - (Number(medicineData.poor_review) / 100 * 100)} 
                      r="5" 
                      className="data-point poor"
                    />
                  )}
                  {Number(medicineData.average_review) > 0 && (
                    <circle 
                      cx="150" 
                      cy={100 - (Number(medicineData.average_review) / 100 * 100)} 
                      r="5" 
                      className="data-point average"
                    />
                  )}
                  {Number(medicineData.excellent_review) > 0 && (
                    <circle 
                      cx="300" 
                      cy={100 - (Number(medicineData.excellent_review) / 100 * 100)} 
                      r="5" 
                      className="data-point excellent"
                    />
                  )}
                  
                  {/* Value labels */}
                  {Number(medicineData.poor_review) > 0 && (
                    <text 
                      x="0" 
                      y={100 - (Number(medicineData.poor_review) / 100 * 100) - 10} 
                      className="value-label poor"
                    >
                      {medicineData.poor_review}%
                    </text>
                  )}
                  {Number(medicineData.average_review) > 0 && (
                    <text 
                      x="150" 
                      y={100 - (Number(medicineData.average_review) / 100 * 100) - 10} 
                      className="value-label average"
                    >
                      {medicineData.average_review}%
                    </text>
                  )}
                  {Number(medicineData.excellent_review) > 0 && (
                    <text 
                      x="300" 
                      y={100 - (Number(medicineData.excellent_review) / 100 * 100) - 10} 
                      className="value-label excellent"
                    >
                      {medicineData.excellent_review}%
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button">Add Medicine</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicine;