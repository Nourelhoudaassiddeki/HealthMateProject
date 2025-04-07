import React from 'react';
import { FaEye, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductCarduser = ({ product, setCartItems }) => {
  const { id, name, image_url, price, quantity } = product; // Note: product.id is the medicine id
  const navigate = useNavigate();

  // Add to Cart Function
  const addToCart = () => {
    const user = JSON.parse(localStorage.getItem("user")); // Check if user is logged in

    if (!user) {
      alert("You must be logged in to add items to the cart.");
      window.location.href = "/login"; // Force redirect to login page
      return;
    }

    // Retrieve the existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if the product is already in the cart (by comparing product.id)
    const existingProduct = cart.find((item) => item.id === id);

    if (existingProduct) {
      existingProduct.quantity += 1; // Increase quantity by 1
    } else {
      // IMPORTANT: Add medicine_id property so that later getPharmacyId receives it.
      cart.push({ ...product, quantity: 1, medicine_id: id });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(cart); // Update the cart items state in the parent component
    alert(`${name} added to cart!`);
  };

  return (
    <div className="product-card">
      <div className="product-image" onClick={() => navigate(`/medicine/${id}`)} style={{ cursor: 'pointer' }}>
        <img src={image_url} alt={name} />
      </div>

      <div className="product-details">
        <h3 className="product-name">{name}</h3>

        <div className="product-price">
          <span className="current-price">{price}DH</span>
        </div>

        <div className="product-quantity">
          <span>{quantity} in stock</span>
        </div>

        <div className="product-actions">
          <button className="quick-view-btn" onClick={(e) => e.stopPropagation()}>
            <FaEye /> QUICK VIEW
          </button>

          <button className="add-to-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(); }}>
            <FaShoppingCart /> ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCarduser;



