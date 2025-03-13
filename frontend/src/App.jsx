import { useState } from "react";
import axios from "axios";
import "./App.css"; // Keep styles in a separate CSS file

function App() {
  const [inputs, setInputs] = useState({
    total_sqft: "",
    bhk: "",
    bath: "",
    location: "",
  });

  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPrice(null);

    try {
      const response = await axios.post(
        "https://housepriceprediction-backend.onrender.com",
        inputs
      );
      const formattedPrice = formatPrice(parseFloat(response.data.price));
      setPrice(formattedPrice);
    } catch (error) {
      console.error("Error fetching prediction", error);
      setError("Failed to fetch prediction. Try again.");
    }
  };

  // Function to format price in Crores and Lakhs with decimals
  const formatPrice = (price) => {
    if (isNaN(price) || price <= 0) return "Invalid Price";

    const crores = Math.floor(price / 100); // 1 Crore = 100 Lakhs
    const remainingLakhs = price % 100; // Remaining lakhs

    if (crores > 0) {
      return `${crores}.${Math.round((remainingLakhs / 100) * 100)} Crores`;
    } else {
      return `${remainingLakhs.toFixed(2)} Lakhs`;
    }
  };

  return (
    <div className="container">
      {/* <h2>House Price Prediction</h2> */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="total_sqft"
          placeholder="Enter Area (sqft)"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="bhk"
          placeholder="Enter BHK"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="bath"
          placeholder="Enter Bathrooms"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Enter Location"
          onChange={handleChange}
          required
        />
        <button type="submit">Estimate Price</button>
      </form>
      {error && <p className="error">{error}</p>}
      {price && <h3>Estimated Price: ₹{price}</h3>}
    </div>
  );
}

export default App;
