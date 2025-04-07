import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./pharma.css";
import ProductCard from "./ProductCard";

const PharmaEssaouira = () => {
  const { id } = useParams(); // Pharmacy ID from URL
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // To handle loading state
  const [user, setUser] = useState(null); // Store user data

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser); // Store user data
    const pharmacyIdFromUrl = Number(id); // Convert string ID to number

    // Redirect if user is not logged in or doesn't belong to this pharmacy
    if (!storedUser || storedUser.pharmacy_id !== pharmacyIdFromUrl) {
      navigate("/login");
      return;
    }

    // Fetch medicines and pharmacy medicines data
    const fetchMedicines = async () => {
      try {
        const medicineResponse = await fetch("http://localhost:5000/medicines");
        const medicinesData = await medicineResponse.json();

        const pharmacyMedicinesResponse = await fetch(
          `http://localhost:5000/pharmacy-medicines?pharmacy=${pharmacyIdFromUrl}`
        );
        const pharmacyMedicinesData = await pharmacyMedicinesResponse.json();

        // Filter pharmacy medicines for the correct pharmacy
        const medicinesForPharmacy = pharmacyMedicinesData.filter(
          (item) => item.pharmacy_id === pharmacyIdFromUrl
        );
        // Now filter the medicines for the selected pharmacy
        const medicinesWithQuantity = medicinesData.map((medicine) => {
          const pharmacyMedicine = medicinesForPharmacy.find(
            (item) => item.medicine_id === parseInt(medicine.id)
          );

          const updatedMedicine = {
            ...medicine,
            quantity: pharmacyMedicine ? pharmacyMedicine.quantity : 0, // Add quantity if found, else set to 0
          };

          return updatedMedicine;
        });

        // Filter out medicines that have 0 quantity
        const availableMedicines = medicinesWithQuantity.filter(
          (medicine) => medicine.quantity > 0
        );

        setMedicines(availableMedicines);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Even if there's an error, stop loading
      }
    };

    fetchMedicines();
  }, [id, navigate]);

  // Filter medicines based on search query
  const filteredMedicines = medicines.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pharma-container">
      <h2 >Welcome to Pharma </h2>
      <p>Available Medicines:</p>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading medicines...</p>
      ) : (
        <div className="products-grid">
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p>No medicines available matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PharmaEssaouira;
