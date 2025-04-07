import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaShoppingCart } from 'react-icons/fa';  // Importing icons
import ProductCarduser from "../availablepharma/ProductCarduser"; // Adjust the path if needed

const Shop = () => {
  const navigate = useNavigate();
  
  // Load cart items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.07;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  // Update the quantity of a product
  const updateQuantity = (id, quantity) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + quantity) };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Remove an item from the cart
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Clear the cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  // Navigate to products page
  const goToProducts = () => {
    navigate('/products');
  };

  // Function to fetch the pharmacy id for a given medicine id
  const getPharmacyId = async (medicineId) => {
    if (!medicineId) {
      console.error("No medicine ID provided!");
      return null;
    }
    try {
      const response = await fetch(`http://localhost:5000/pharmacy-medicines?medicine_id=${medicineId}`);
      const data = await response.json();
      if (data.length > 0) {
        return data[0].pharmacy_id;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching pharmacy ID:", error);
      return null;
    }
  };

  const handleCheckout = () => {
    // Save the cart and total to localStorage so the payment page can access it
    localStorage.setItem("checkoutTotal", total.toFixed(2));
    // Redirect to payment page
    navigate('/payment');
  };

  // Optional: Fetch products to display (if you want to render product cards)
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/medicines");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen" style={{ marginTop: "100px" }}>
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
              <FaShoppingCart className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Your cart is currently empty. Start shopping to add items to your cart.
            </p>
            <button 
              onClick={goToProducts}
              className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <div className="mb-10">
                <h2 className="sr-only">Items in your cart</h2>
                
                <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </p>
                  <button 
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear cart
                  </button>
                </div>

                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <li key={item.id} className="py-6 flex">
                      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-center object-cover"
                        />
                      </div>
                        
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.category && <span>{item.category}</span>}
                            {item.size && <span> • Size: {item.size}</span>}
                          </p>
                        </div>
                          
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-gray-800 font-medium border-l border-r">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                            

                          <button
                            onClick={() => removeItem(item.id)}
                            className="font-medium text-green-600 hover:text-green-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button 
                    onClick={goToProducts}
                    className="text-sm font-medium text-green-600 hover:text-green-500 flex items-center"
                  >
                    <FaEye className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4 mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-base text-gray-600">
                    <p>Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between text-base text-gray-600">
                    <p>Tax (7%)</p>
                    <p>${tax.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between text-base text-gray-600">
                    <div>
                      <p>Shipping</p>
                      {shipping > 0 && (
                        <p className="text-xs text-green-600 mt-1">Free shipping on orders over $100</p>
                      )}
                    </div>
                    <p>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-medium text-gray-900">
                      <p>Total</p>
                      <p>${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={handleCheckout}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
                  >
                    Proceed to Checkout
                  </button>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                      Secure Checkout
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">We Accept</h3>
                  <div className="flex space-x-2">
                    <div className="p-2 bg-gray-100 rounded">
                      <svg className="h-6 w-10 text-gray-500" viewBox="0 0 36 24" fill="currentColor">
                        <rect width="36" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
                        <path d="M10.5 10.5h3v6h-3v-6z" fill="currentColor"/>
                        <path d="M15 10.5h3v6h-3v-6z" fill="currentColor"/>
                        <path d="M24 13.5c0 1.65-1.35 3-3 3h-15v-6h15c1.65 0 3 1.35 3 3z" fill="currentColor" fillOpacity="0.3"/>
                      </svg>
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      <svg className="h-6 w-10 text-gray-500" viewBox="0 0 36 24" fill="currentColor">
                        <rect width="36" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
                        <path d="M22.88 15h-1.67c-.11 0-.2-.04-.2-.04l-2.2-1.46-2.21 1.46s-.08.04-.17.04h-1.68c-.56 0-.63-.43-.14-.96L18 10.06c.26-.34.77-.34 1.04 0l3.98 4c.48.52.42.94-.14.94z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      <svg className="h-6 w-10 text-gray-500" viewBox="0 0 36 24" fill="currentColor">
                        <rect width="36" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
                        <path d="M18 15a3 3 0 100-6 3 3 0 000 6z" fill="currentColor"/>
                        <path d="M13 12c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5zm13-3h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2z" fill="currentColor" fillOpacity="0.3"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Shop;