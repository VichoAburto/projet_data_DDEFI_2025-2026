from __future__ import annotations

import os
from typing import Dict, Any, List

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="ML Service (demo)", version="0.1.0")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # ml_service/
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "models", "model.joblib"))

ASSETS: Dict[str, Any] = {}  # will hold {"model": ..., "features": [...]}

class PredictRequest(BaseModel):
    features: Dict[str, float] = Field(..., description="Feature map, ex: {'x1': 1.2, ..., 'x12': -0.3}")

class PredictResponse(BaseModel):
    prediction: float
    used_features: List[str]

@app.on_event("startup")
def load_model():
    global ASSETS

    if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) == 0:
        # No crasheamos: devolvemos salud indicando que falta el modelo
        ASSETS = {}
        return

    ASSETS = joblib.load(MODEL_PATH)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": bool(ASSETS),
        "model_path": MODEL_PATH,
        "hint": "Run: python train.py  (from ml_service/) to create the demo model" if not ASSETS else None,
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not ASSETS:
        raise HTTPException(status_code=500, detail="Model not loaded. Run: python train.py")

    model = ASSETS["model"]
    feature_names = ASSETS["features"]

    missing = [f for f in feature_names if f not in req.features]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing features: {missing}")

    x = np.array([[float(req.features[f]) for f in feature_names]], dtype=float)
    y = model.predict(x)

    return PredictResponse(prediction=float(y[0]), used_features=feature_names)
