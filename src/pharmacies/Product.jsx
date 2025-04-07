import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../availablepharma/ProductCarduser";
import "./product.css"
const Product = () => {
  const { id } = useParams(); // Pharmacy ID from URL (string)
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // To handle loading state

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const medicineResponse = await fetch("http://localhost:5000/medicines");
        const medicinesData = await medicineResponse.json();

        // Remove duplicate medicines by using a Set for unique medicine IDs
        const uniqueMedicines = Array.from(
          new Set(medicinesData.map((medicine) => medicine.id))
        ).map((id) => medicinesData.find((medicine) => medicine.id === id));

        setMedicines(uniqueMedicines);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [id, navigate]);

  // Filter medicines based on search query
  const filteredMedicines = medicines.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Welcome to Pharma </h2>
      
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

export default Product;
