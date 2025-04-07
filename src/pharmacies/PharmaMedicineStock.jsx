import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams to get URL params
import axios from "axios";
import "../assets/pharmastock.css";

const PharmacyMedicineStock = () => {
  const { pharmacyId } = useParams(); // Get pharmacyId from URL
// Convert to number
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(0);

  const numericPharmacyId = pharmacyId ? Number(pharmacyId) : null; // Ensure it's a valid number or null
  
  useEffect(() => {
    if (numericPharmacyId) {
      fetchMedicines();
      fetchAllMedicines();
    }
  }, [numericPharmacyId]);

  // Fetch medicines for the pharmacy from URL param
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/pharmacy-medicines?pharmacy_id=${numericPharmacyId}`);
      setMedicines(response.data);
      console.log(`Fetched Medicines for Pharmacy ID ${numericPharmacyId}:`, response.data);
    } catch (error) {
      console.error("Error fetching pharmacy medicines", error);
    }
    setLoading(false);
  };

  // Fetch all medicines to get names
  const fetchAllMedicines = async () => {
    try {
      const response = await axios.get("http://localhost:5000/medicines");
      setAllMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines", error);
    }
  };

  // Update medicine quantity
  const updateQuantity = async () => {
    if (!selectedMedicine) return;
    try {
      await axios.patch(`http://localhost:5000/pharmacy-medicines/${selectedMedicine.id}`, { quantity });
      fetchMedicines();
      closeModal();
    } catch (error) {
      console.error("Error updating quantity", error);
    }
  };

  // Delete medicine (from pharmacy and main list if needed)
  const deleteMedicine = async (id, medicineId) => {
    try {
      await axios.delete(`http://localhost:5000/pharmacy-medicines/${id}`);

      const response = await axios.get(`http://localhost:5000/pharmacy-medicines?medicine_id=${medicineId}`);
      if (response.data.length === 0) {
        await axios.delete(`http://localhost:5000/medicines/${medicineId}`);
        fetchAllMedicines();
      }

      fetchMedicines();
    } catch (error) {
      console.error("Error deleting medicine", error);
    }
  };

  // Open/close modal
  const openModal = (medicine) => {
    setSelectedMedicine(medicine);
    setQuantity(medicine.quantity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedicine(null);
    setQuantity(0);
  };

  // Get medicine name from allMedicines list
  const getMedicineName = (medicineId) => {
    const medicine = allMedicines.find(m => Number(m.id) === Number(medicineId));
    return medicine ? medicine.name : "Unknown Medicine";
  };

  return (
    <div className="pharmacy-stock-container">
      <h2>Pharmacy Medicine Stock </h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.length > 0 ? (
              medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td>{getMedicineName(medicine.medicine_id)}</td>
                  <td>{medicine.quantity}</td>
                  <td>
                    <button className="update-btn" onClick={() => openModal(medicine)}>Update</button>
                    <button className="delete-btn" onClick={() => deleteMedicine(medicine.id, medicine.medicine_id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No medicines found for this pharmacy.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Update Quantity Modal */}
      {isModalOpen && selectedMedicine && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Quantity</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateQuantity();
              }}
            >
              <label>
                New Quantity:
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="0"
                />
              </label>
              <br />
              <div className="modal-actions">
                <button type="submit" className="save-btn">Update</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyMedicineStock;



