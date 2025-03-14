const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(
  cors({
    origin: "https://housepriceprediction-1-frontend.onrender.com", // Your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());

// Root Route
app.get("/", (req, res) => {
  res.send("✅ Server is running! Use the /predict endpoint with a POST request.");
});

// Debug Route for GET /predict
app.get("/predict", (req, res) => {
  res.send("⚠️ Use a POST request with JSON data to get predictions.");
});

// Prediction Route (POST)
app.post("/predict", (req, res) => {
  const { total_sqft, bhk, bath, location } = req.body;

  if (!total_sqft || !bhk || !bath || !location) {
    return res.status(400).json({ error: "Missing input values!" });
  }

  if (isNaN(total_sqft) || isNaN(bhk) || isNaN(bath)) {
    return res.status(400).json({ error: "total_sqft, bhk, and bath must be numbers!" });
  }

  // Ensure predict.py path is correct
  const pythonScriptPath = path.join(__dirname, "predict.py");

  const pythonProcess = spawn("python3", [
    pythonScriptPath,
    total_sqft,
    bhk,
    bath,
    location,
  ]);

  let result = "";
  let errorMsg = "";

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data.toString()}`);
    errorMsg += data.toString();
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
