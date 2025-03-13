const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root Route (Fix "Cannot GET /")
app.get("/", (req, res) => {
  res.send(
    "✅ Server is running! Use the /predict endpoint with a POST request."
  );
});

// Debug Route for GET /predict
app.get("/predict", (req, res) => {
  res.send("⚠️ Use a POST request with JSON data to get predictions.");
});

// Prediction Route (POST)
app.post("/predict", (req, res) => {
  const { total_sqft, bhk, bath, location } = req.body;

  // ✅ Check if all inputs are provided
  if (!total_sqft || !bhk || !bath || !location) {
    return res.status(400).json({ error: "Missing input values!" });
  }

  // ✅ Ensure inputs are numbers where required
  if (isNaN(total_sqft) || isNaN(bhk) || isNaN(bath)) {
    return res
      .status(400)
      .json({ error: "total_sqft, bhk, and bath must be numbers!" });
  }

  // ✅ Run Python script
  const pythonProcess = spawn("python3", [
    "predict.py",
    total_sqft,
    bhk,
    bath,
    location,
  ]);

  let result = "";
  let errorMsg = "";

  // ✅ Collect Python output
  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  // ✅ Capture errors
  pythonProcess.stderr.on("data", (data) => {
    errorMsg += data.toString();
  });

  // ✅ Handle script completion
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
