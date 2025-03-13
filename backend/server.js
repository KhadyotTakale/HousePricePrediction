const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(cors());
app.use(express.json()); // ✅ No need for body-parser

// Ensure correct path for Python script
const scriptPath = path.join(__dirname, "predict.py");

// Root Route
app.get("/", (req, res) => {
  res.send("✅ Server is running! Use the /predict endpoint with a POST request.");
});

// Debug Route for GET /predict
app.get("https://housepriceprediction-backend.onrender.com//predict", (req, res) => {
  res.send("⚠️ Use a POST request with JSON data to get predictions.");
});

// Prediction Route
app.post("https://housepriceprediction-backend.onrender.com/predict", (req, res) => {
  const { total_sqft, bhk, bath, location } = req.body;

  if (!total_sqft || !bhk || !bath || !location) {
    return res.status(400).json({ error: "Missing input values!" });
  }
  if (isNaN(total_sqft) || isNaN(bhk) || isNaN(bath)) {
    return res.status(400).json({ error: "total_sqft, bhk, and bath must be numbers!" });
  }

  const pythonProcess = spawn("python3", [scriptPath, total_sqft, bhk, bath, location]);

  let result = "";
  let errorMsg = "";

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorMsg += data.toString();
    console.error("Python Script Error:", errorMsg); // ✅ Log errors
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.json({ price: result.trim() });
    } else {
      console.error(`❌ Python Error: ${errorMsg}`);
      res.status(500).json({ error: "Something went wrong with prediction!" });
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
