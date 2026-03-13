from __future__ import annotations

import os
from datetime import timedelta
from typing import Any, Dict, List, Literal

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.fx_model import forecast_to_date, get_min_fx_from_last_train

app = FastAPI(title="ML Service", version="1.0.0")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "models", "model.joblib"))

ASSETS: Dict[str, Any] = {}


class PlannerRequest(BaseModel):
    currency: Literal["USD", "BRL", "CLP"] = Field(..., description="Source currency")
    days_ahead: int = Field(default=30, ge=1, le=90)


class ForecastPoint(BaseModel):
    date: str
    fx: float


class PlannerResponse(BaseModel):
    currency: str
    supported: bool
    best_date: str
    best_fx: float
    current_date: str
    forecast: List[ForecastPoint]


@app.on_event("startup")
def load_model():
    global ASSETS

    if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) == 0:
        ASSETS = {}
        print("⚠️ Model file not found")
        return

    ASSETS = joblib.load(MODEL_PATH)

    print("✅ Model loaded")
    print("Loaded asset keys:", list(ASSETS.keys()))


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": bool(ASSETS),
        "model_path": MODEL_PATH,
        "supported_currencies_now": ["USD"],
    }


@app.post("/predict-best-day", response_model=PlannerResponse)
def predict_best_day(req: PlannerRequest):
    if not ASSETS:
        raise HTTPException(status_code=500, detail="Model not loaded. Run train.py first.")

    if req.currency != "USD":
        raise HTTPException(
            status_code=400,
            detail="More currencies coming soon 🚀 \
                Currently available: USD → EUR",
        )

    model = ASSETS["model"]
    df_model = ASSETS["df_model"]
    infl_us_ref = ASSETS["infl_us_ref"]
    infl_eu_ref = ASSETS["infl_eu_ref"]
    spread_ref = ASSETS["spread_ref"]

    # FIX This in reality should be based in the current date
    # But for simplicity, we will use the last date in the training data as the "current" date for projections
    current_date = df_model.index.max() - timedelta(days=2)
    target_date = (current_date + timedelta(days=req.days_ahead)).strftime("%Y-%m-%d")

    projection = forecast_to_date(
        df_model=df_model,
        model=model,
        target_date=target_date,
        infl_us_ref=infl_us_ref,
        infl_eu_ref=infl_eu_ref,
        spread_ref=spread_ref,
    )

    min_fx_info = get_min_fx_from_last_train(df_model, projection)

    future_projection = projection[projection.index >= current_date][["fx"]].copy()

    forecast = [
        {"date": idx.strftime("%Y-%m-%d"), "fx": float(row["fx"])}
        for idx, row in future_projection.iterrows()
    ]

    return PlannerResponse(
        currency=req.currency,
        supported=True,
        best_date=min_fx_info["date"].strftime("%Y-%m-%d"),
        best_fx=float(min_fx_info["min_fx"]),
        current_date=current_date.strftime("%Y-%m-%d"),
        forecast=forecast,
    )
