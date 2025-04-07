import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import "./MedicineDetails.css"; // Assuming you'll create this file for the styles

const MedicineDetails = ({ addToCart }) => {
  const { id } = useParams(); // Get the medicine ID from URL
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/medicines/${id}`)  // Fetch from JSON server
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch medicine details");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Medicine:", data);
        setMedicine(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching medicine:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (medicine) {
      addToCart({ ...medicine, quantity });
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    }
  };
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">❌ Error: {error}</div>;
  }

  // If no medicine is found, show a message
  if (!medicine) {
    return <div className="not-found">❌ Medicine not found</div>;
  }

  // Calculate review percentages for progress bars
  const calculateReviewWidth = (percentage) => {
    return { width: `${percentage}%` };
  };

  return (
    <div className="medicine-details-container">
      <div className="medicine-details-card">
        <div className="medicine-image">
          <img src={medicine.image_url} alt={medicine.name} />
        </div>
        
        <div className="medicine-info">
          <h1 className="medicine-name">{medicine.name}</h1>
          <div className="medicine-price">{medicine.price} MAD</div>
          
          <div className="medicine-manufacturer">
            <span>Manufacturer:</span> {medicine.manufacturer}
          </div>
          
          <div className="medicine-specs">
            <h3>Composition</h3>
            <p>{medicine.composition}</p>
            
            <h3>Uses</h3>
            <p>{medicine.uses}</p>
            
            <h3>Side Effects</h3>
            <p>{medicine.side_effects}</p>
          </div>
          
          <div className="medicine-reviews">
            <h3> Reviews</h3>
            
            <div className="review-row">
              <span className="review-label">Excellent</span>
              <div className="review-bar">
                <div 
                  className="review-progress excellent" 
                  style={calculateReviewWidth(medicine.excellent_review)}
                ></div>
              </div>
              <span className="review-percentage">{medicine.excellent_review}%</span>
            </div>
            
            <div className="review-row">
              <span className="review-label">Average</span>
              <div className="review-bar">
                <div 
                  className="review-progress average" 
                  style={calculateReviewWidth(medicine.average_review)}
                ></div>
              </div>
              <span className="review-percentage">{medicine.average_review}%</span>
            </div>
            
            <div className="review-row">
              <span className="review-label">Poor</span>
              <div className="review-bar">
                <div 
                  className="review-progress poor" 
                  style={calculateReviewWidth(medicine.poor_review)}
                ></div>
              </div>
              <span className="review-percentage">{medicine.poor_review}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prop validation for the `addToCart` function
MedicineDetails.propTypes = {
  addToCart: PropTypes.func.isRequired,
};

export default MedicineDetails;




