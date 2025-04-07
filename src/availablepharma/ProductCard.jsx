import React from 'react';
import { FaStar, FaRegStar, FaShoppingCart, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { id, name, image_url, price, quantity } = product;
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <div className="product-image" onClick={() => navigate(`/medicine/${id}`)} style={{ cursor: 'pointer' }}>
        <img src={image_url} alt={name} />
      </div>
      
      <div className="product-details">
        <h3 className="product-name">{name}</h3>
        
        <div className="product-price">
          <span className="current-price">{price}MAD</span>
        </div>

        <div className="product-quantity">
          <span>{quantity} in stock</span>
        </div>
        
        <div className="product-actions">
          <button className="quick-view-btn" onClick={(e) => e.stopPropagation()}>
            <FaEye /> QUICK VIEW
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

