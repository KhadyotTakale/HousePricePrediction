import sys
import pickle
import numpy as np

# Load trained model
with open("house_price_model.pkl", "rb") as file:
    model = pickle.load(file)

# ✅ Load feature names
with open("columns.pkl", "rb") as file:
    columns = pickle.load(file)

# Read input arguments
try:
    total_sqft = float(sys.argv[1])
    bhk = int(sys.argv[2])
    bath = int(sys.argv[3])
    location = sys.argv[4]
except:
    print("Error: Usage: python predict.py <total_sqft> <bhk> <bath> <location>")
    sys.exit(1)

# Create feature vector with zeros
features = np.zeros(len(columns))

# Assign numerical values
features[columns.index("total_sqft")] = total_sqft
features[columns.index("bhk")] = bhk
features[columns.index("bath")] = bath

# Handle location encoding
if location in columns:
    features[columns.index(location)] = 1

# Convert to 2D array and predict
features = features.reshape(1, -1)
predicted_price = model.predict(features)[0]

print(predicted_price)
