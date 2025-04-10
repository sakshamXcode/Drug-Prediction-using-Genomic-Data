from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf
import uvicorn
import os


# Initialize FastAPI app
app = FastAPI(
    title="Drug Prediction API",
    description="API for predicting drug names based on genomic and pharmacological features",
    version="1.0.0"
)

# Enable CORS for frontend communication
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to model and artifacts
MODEL_PATH = "drug_prediction_model.keras"
PREPROCESSOR_PATH = "preprocessor.pkl"
LABEL_ENCODER_PATH = "label_encoder.pkl"

# Load model and preprocessing tools on startup
@app.on_event("startup")
async def load_model():
    global model, preprocessor, label_encoder, feature_names

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    if not os.path.exists(PREPROCESSOR_PATH):
        raise FileNotFoundError(f"Preprocessor file not found: {PREPROCESSOR_PATH}")
    if not os.path.exists(LABEL_ENCODER_PATH):
        raise FileNotFoundError(f"Label encoder file not found: {LABEL_ENCODER_PATH}")

    try:
        model = tf.keras.models.load_model(MODEL_PATH)

        with open(PREPROCESSOR_PATH, 'rb') as f:
            preprocessor = pickle.load(f)

        with open(LABEL_ENCODER_PATH, 'rb') as f:
            label_encoder = pickle.load(f)

        feature_names = [
            'Target Pathway', 'Feature Name',
            'ic50_effect_size',
            'feature_pos_ic50_var', 'feature_neg_ic50_var',
            'feature_pval', 'tissue_pval', 'msi_pval',
            'mutation_response_ratio', 'mutation_ratio'
        ]

        print("Model and preprocessing components loaded successfully")
    except Exception as e:
        print(f"Error loading model or components: {e}")
        raise

# Request model from frontend
class DrugPredictionInput(BaseModel):
    target_pathway: str
    feature_name: str
    ic50_effect_size: float
    feature_pos_ic50_var: float
    feature_neg_ic50_var: float
    feature_pval: float
    tissue_pval: float
    msi_pval: float
    mutation_response_ratio: Optional[float] = None
    mutation_ratio: Optional[float] = None

    class Config:
        schema_extra = {
            "example": {
                "target_pathway": "DNA replication",
                "feature_name": "ABCB1_mut",
                "ic50_effect_size": 1.25,
                "feature_pos_ic50_var": 1.57,
                "feature_neg_ic50_var": 1.83,
                "feature_pval": 0.06,
                "tissue_pval": 0.0,
                "msi_pval": 0.1,
                "mutation_response_ratio": 0.8,
                "mutation_ratio": 0.65
            }
        }

# Response model
class DrugPredictionOutput(BaseModel):
    predicted_drug: str
    confidence: float
    top_predictions: List[dict]


# Main prediction endpoint
@app.post("/predict/", response_model=DrugPredictionOutput)
async def predict_drug(input_data: DrugPredictionInput):
    try:
        input_dict = input_data.dict()

        # Build a data frame with all expected features
        mapped_input = {
            'Target Pathway': input_dict['target_pathway'],
            'Feature Name': input_dict['feature_name'],
            'ic50_effect_size': input_dict['ic50_effect_size'],
            'feature_pos_ic50_var': input_dict['feature_pos_ic50_var'],
            'feature_neg_ic50_var': input_dict['feature_neg_ic50_var'],
            'feature_pval': input_dict['feature_pval'],
            'tissue_pval': input_dict['tissue_pval'],
            'msi_pval': input_dict['msi_pval'],
            'mutation_response_ratio': input_dict.get('mutation_response_ratio'),
            'mutation_ratio': input_dict.get('mutation_ratio')
        }

        input_df = pd.DataFrame([mapped_input])

        # Ensuring that all required columns are present and in the correct order otherwise prediction may go wrong.
        for col in feature_names:
            if col not in input_df.columns:
                input_df[col] = None
        input_df = input_df[feature_names]

        # Preprocess input
        input_processed = preprocessor.transform(input_df)

        # Predict
        prediction_proba = model.predict(input_processed)
        predicted_label_index = np.argmax(prediction_proba, axis=1)[0]
        predicted_drug_name = label_encoder.inverse_transform([predicted_label_index])[0]
        confidence = float(prediction_proba[0, predicted_label_index])

        # Get top 5 predictions
        top_indices = np.argsort(prediction_proba[0])[::-1][:5]
        top_predictions = [
            {
                "drug": label_encoder.inverse_transform([idx])[0],
                "Confidence": float(prediction_proba[0, idx])
            }
            for idx in top_indices
        ]

        return {
            "predicted_drug": predicted_drug_name,
            "confidence": confidence,
            "top_predictions": top_predictions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Root health-check endpoint
@app.get("/")
async def root():
    return {
        "message": "Drug Prediction API is running",
        "status": "healthy",
        "model_loaded": model is not None,
        "version": "1.0.0"
    }

# Run server
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
