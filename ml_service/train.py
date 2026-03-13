import os
import joblib

from app.fx_model import (
    FEATURES,
    TARGETS,
    load_and_clean_data,
    prepare_supervised_data,
    train_xgboost_model,
    build_monthly_references,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.joblib")


def main():
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

    df_model = load_and_clean_data(DATA_DIR)
    X_train, X_test, Y_train, Y_test = prepare_supervised_data(df_model)
    model = train_xgboost_model(X_train, Y_train)

    infl_us_ref, infl_eu_ref, spread_ref = build_monthly_references(df_model)

    artifact = {
        "model": model,
        "features": FEATURES,
        "targets": TARGETS,
        "df_model": df_model,
        "infl_us_ref": infl_us_ref,
        "infl_eu_ref": infl_eu_ref,
        "spread_ref": spread_ref,
    }

    joblib.dump(artifact, MODEL_PATH)
    print(f"Real model trained and saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
