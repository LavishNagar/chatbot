# backend-python/train_model.py
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
import joblib

# Build synthetic training data (replace with your real dataset if available)
n = 500
rng = np.random.default_rng(42)
d = {
    "property_type": rng.choice(["SFH","Condo"], size=n, p=[0.5,0.5]),
    "lot_area": rng.integers(800, 8000, size=n),
    "building_area": rng.integers(400, 3500, size=n),
    "bedrooms": rng.integers(1, 6, size=n),
    "bathrooms": rng.integers(1, 4, size=n),
    "year_built": rng.integers(1950, 2022, size=n),
    "has_pool": rng.choice([0,1], size=n, p=[0.9,0.1]),
    "has_garage": rng.choice([0,1], size=n, p=[0.6,0.4]),
    "school_rating": rng.integers(1, 11, size=n),
}

df = pd.DataFrame(d)

# Construct a target price using a made-up formula (for demo only)
base = 50000
df["price"] = (base
               + df["bedrooms"] * 30000
               + df["bathrooms"] * 20000
               + df["building_area"] * 150
               + df["lot_area"] * 10 * (df["property_type"] == "SFH").astype(int)
               - (2025 - df["year_built"]) * 200
               + df["has_pool"] * 50000
               + df["has_garage"] * 15000
               + df["school_rating"] * 3000
              )

# Feature engineering function: we want to present exactly the features your FastAPI will expect
def prepare_input_dataframe(df_in):
    # Use building_area for condos, lot_area for SFH. For missing ones, set 0.
    df2 = df_in.copy()
    # If a property is Condo, lot_area might be irrelevant; but keep both as columns.
    # Convert booleans to ints
    df2["has_pool"] = df2["has_pool"].astype(int)
    df2["has_garage"] = df2["has_garage"].astype(int)
    return df2

X = prepare_input_dataframe(df.drop(columns=["price"]))
y = df["price"]

# Simple preprocessing: one-hot encode property_type + numeric scaling for numeric columns
categorical = ["property_type"]
numeric = ["lot_area", "building_area", "bedrooms", "bathrooms", "year_built", "has_pool", "has_garage", "school_rating"]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
    ("num", StandardScaler(), numeric)
])

pipeline = Pipeline([
    ("pre", preprocessor),
    ("est", RandomForestRegressor(n_estimators=100, random_state=42))
])

pipeline.fit(X, y)

# Save model (use joblib for sklearn pipelines)
joblib.dump(pipeline, "complex_price_model_v2.pkl")
print("Saved complex_price_model_v2.pkl (sklearn pipeline)")
