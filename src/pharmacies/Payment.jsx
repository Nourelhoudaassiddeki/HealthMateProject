import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./payment.css";
import "./SuccesPage";
export default function Payment() {
  const navigate = useNavigate();

  // Get total amount from localStorage
  const [totalAmount, setTotalAmount] = useState(0);
  // Get cart items from localStorage
  const [cartItems, setCartItems] = useState([]);
  
  useEffect(() => {
    const amount = localStorage.getItem("checkoutTotal");
    if (!amount) {
      // Redirect back to cart if no total found
      navigate('/shop');
      return;
    }
    setTotalAmount(parseFloat(amount));
    
    const cart = localStorage.getItem("cart");
    if (cart) {
      setCartItems(JSON.parse(cart));
    }
  }, [navigate]);

  const [order, setOrder] = useState({
    patient_name: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
  });

  const [payment, setPayment] = useState({
    card_number: "",
    payment_method: "Credit Card",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pharmacyOptions, setPharmacyOptions] = useState({});

  const handleOrderChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handlePharmacyChange = (medicineId, pharmacyId) => {
    const updatedCartItems = cartItems.map(item => {
      if (item.medicine_id === medicineId) {
        return { ...item, pharmacy_id: pharmacyId };
      }
      return item;
    });
    setCartItems(updatedCartItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!order.patient_name || !order.address || !order.city || 
        !order.postcode || !order.phone || !payment.card_number) {
      setError("All fields must be filled.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create Order
      const orderResponse = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (!orderResponse.ok) throw new Error("Failed to create order");
      const newOrder = await orderResponse.json();
      const orderId = newOrder.id;

      console.log("Order Created with ID:", orderId);

      // Step 2: Create Payment
      const paymentResponse = await fetch("http://localhost:5000/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_number: `**** **** **** ${payment.card_number.slice(-4)}`, // Mask card number
          payment_method: payment.payment_method,
          order_id: orderId,
          amount: totalAmount,
          payment_date: new Date().toISOString(),
        }),
      });

      if (!paymentResponse.ok) throw new Error("Failed to process payment");
      const paymentData = await paymentResponse.json();
      console.log("Payment processed:", paymentData);

      // Step 3: Create Order Items and update inventory for each cart item
      for (const item of cartItems) {
        const pharmacyId = item.pharmacy_id;

        if (!pharmacyId) {
          throw new Error(`Please select a pharmacy for ${item.name}`);
        }

        // Create order item
        const orderItemResponse = await fetch("http://localhost:5000/order_items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            medicine_id: item.medicine_id,
            pharmacy_id: pharmacyId,
            quantity: item.quantity,
          }),
        });

        if (!orderItemResponse.ok) throw new Error(`Failed to create order item for ${item.name} at pharmacy ${pharmacyId}`);

        // Update inventory - reduce the quantity at the pharmacy
        const pharmaMedicineRes = await fetch(`http://localhost:5000/pharmacy-medicines?medicine_id=${item.medicine_id}&pharmacy_id=${pharmacyId}`);
        if (!pharmaMedicineRes.ok) throw new Error(`Failed to find pharmacy medicine for ${item.name}`);
        
        const pharmaMedicine = await pharmaMedicineRes.json();
        const quantityAvailable = pharmaMedicine[0].quantity;

        const newQuantity = Math.max(0, quantityAvailable - item.quantity);
        const updateStockResponse = await fetch(`http://localhost:5000/pharmacy-medicines/${pharmaMedicine[0].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (!updateStockResponse.ok) throw new Error(`Failed to update stock for ${item.name} at pharmacy ${pharmacyId}`);
        console.log(`Updated stock for medicine ${item.medicine_id} at pharmacy ${pharmacyId}: ${quantityAvailable} → ${newQuantity}`);
      }

      // Order successful, clear cart
      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutTotal");
      
     // In your handleSubmit function, right before navigation
console.log("About to navigate to success page");
navigate('/success', { state: { orderId: orderId } });
console.log("Navigation called"); // See if this executes
      
    } catch (error) {
      console.error("Checkout Error:", error);
      setError(error.message || "An error occurred while processing your order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch available pharmacies for each medicine in the cart
    async function fetchPharmacies() {
      const pharmacyData = {};
      
      for (const item of cartItems) {
        const response = await fetch(`http://localhost:5000/pharmacy-medicines?medicine_id=${item.medicine_id}`);
        if (response.ok) {
          const data = await response.json();

          // Fetch pharmacy details for each available pharmacy
          const pharmacies = await Promise.all(data.map(async (entry) => {
            const pharmacyRes = await fetch(`http://localhost:5000/pharmacies/${entry.pharmacy_id}`);
            const pharmacyData = await pharmacyRes.json();
            return { ...pharmacyData, pharmacy_id: entry.pharmacy_id, quantity: entry.quantity };
          }));

          pharmacyData[item.medicine_id] = pharmacies;
        }
      }
      
      setPharmacyOptions(pharmacyData);
    }

    if (cartItems.length) {
      fetchPharmacies();
    }
  }, [cartItems]);

  return (
    <div className="p-6 max-w-2xl mx-auto my-8">
      <h1 className="text-2xl font-bold text-center mb-6">Complete Your Purchase</h1>
      
      <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
        {error && <div className="text-red-500 p-3 bg-red-50 rounded">{error}</div>}

        {/* Order Details */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">Order Details</h2>
          <input 
            type="text" 
            name="patient_name" 
            placeholder="Patient Name" 
            className="w-full p-2 border rounded mt-2"
            onChange={handleOrderChange} 
            required 
          />
          <input 
            type="text" 
            name="address" 
            placeholder="Address" 
            className="w-full p-2 border rounded mt-2"
            onChange={handleOrderChange} 
            required 
          />
          <input 
            type="text" 
            name="city" 
            placeholder="City" 
            className="w-full p-2 border rounded mt-2"
            onChange={handleOrderChange} 
            required 
          />
          <input 
            type="text" 
            name="postcode" 
            placeholder="Postcode" 
            className="w-full p-2 border rounded mt-2"
            onChange={handleOrderChange} 
            required 
          />
          <input 
            type="text" 
            name="phone" 
            placeholder="Phone" 
            className="w-full p-2 border rounded mt-2"
            onChange={handleOrderChange} 
            required 
          />
        </div>

        {/* Payment Details */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">Payment Details</h2>

          {/* Display the total amount */}
          <div className="mt-2">
            <label className="block text-sm font-semibold">Total Amount</label>
            <input 
              type="text" 
              value={`$${totalAmount}`} 
              className="w-full p-2 border rounded mt-1 bg-gray-200 text-gray-600" 
              readOnly 
            />
          </div>

          <input 
            type="text" 
            name="card_number" 
            placeholder="Card Number" 
            className="w-full p-2 border rounded mt-2"
            onChange={handlePaymentChange} 
            required 
          />
          <select 
            name="payment_method" 
            className="w-full p-2 border rounded mt-2" 
            onChange={handlePaymentChange}
          >
            <option value="Credit Card">Credit Card</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>

        {/* Order Summary */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
          <div className="max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="py-2">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.quantity} x ${item.price}</span>
                  </div>
                  <div className="mt-2">
                    <select 
                      className="w-full p-2 border rounded" 
                      value={item.pharmacy_id || ""}
                      onChange={(e) => handlePharmacyChange(item.medicine_id, e.target.value)}
                    >
                      <option value="">Select Pharmacy</option>
                      {pharmacyOptions[item.medicine_id] && pharmacyOptions[item.medicine_id].map((pharmacy) => (
                        <option key={pharmacy.pharmacy_id} value={pharmacy.pharmacy_id}>
                          {pharmacy.name} - {pharmacy.quantity} in stock
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button 
            type="submit" 
            disabled={loading} 
            className={`px-6 py-3 text-white font-semibold rounded-lg ${loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
