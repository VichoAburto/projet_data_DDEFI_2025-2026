import os
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # ml_service/
DATA_PATH = os.path.join(BASE_DIR, "data", "data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.joblib")

FEATURES = [f"x{i}" for i in range(1, 13)]
TARGET = "y"

def make_dummy_data(n_rows: int = 7000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    X = rng.normal(size=(n_rows, len(FEATURES)))
    # target = combinación lineal + ruido
    coefs = rng.normal(size=(len(FEATURES),))
    y = X @ coefs + rng.normal(scale=0.3, size=n_rows)

    df = pd.DataFrame(X, columns=FEATURES)
    df[TARGET] = y
    return df

def main():
    os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

    # Si no existe el CSV, lo creamos
    if not os.path.exists(DATA_PATH):
        df = make_dummy_data()
        df.to_csv(DATA_PATH, index=False)
        print(f"✅ Created dummy dataset at {DATA_PATH}")
    else:
        df = pd.read_csv(DATA_PATH)
        print(f"✅ Loaded dataset at {DATA_PATH} with shape {df.shape}")

    # Entrenar modelo simple
    X = df[FEATURES].values
    y = df[TARGET].values

    model = LinearRegression()
    model.fit(X, y)

    # Guardar modelo
    joblib.dump({"model": model, "features": FEATURES}, MODEL_PATH)
    print(f"✅ Trained + saved model at {MODEL_PATH}")

if __name__ == "__main__":
    main()