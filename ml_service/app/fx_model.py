from __future__ import annotations

from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor


TARGETS = ["log_return", "vix"]

FEATURES = [
    "vix",
    "vix_change",
    "inflation_us_mom",
    "inflation_eu_mom",
    "spread_rates",
    "ret_lag1",
    "ret_lag2",
    "fx_volatility_10d",
]


def load_and_clean_data(data_dir: str | Path) -> pd.DataFrame:
    data_dir = Path(data_dir)

    # --- VIX ---
    df_vix = pd.read_csv(data_dir / "VIX.csv")
    df_vix["observation_date"] = pd.to_datetime(df_vix["observation_date"]).dt.normalize()
    df_vix = df_vix.sort_values("observation_date").drop_duplicates(subset="observation_date")
    df_vix["vix_level"] = pd.to_numeric(df_vix["VIXCLS"], errors="coerce")

    df_base = pd.DataFrame({"date": df_vix["observation_date"]})
    df_base = df_base.drop_duplicates(subset="date").sort_values("date").set_index("date")
    df_base["vix"] = df_vix.set_index("observation_date")["vix_level"].reindex(df_base.index)
    df_base["vix"] = df_base["vix"].ffill()

    # --- FX ---
    df_fx = pd.read_csv(data_dir / "USA_Exchange_Rate.csv")
    df_fx["observation_date"] = pd.to_datetime(df_fx["observation_date"]).dt.normalize()
    df_fx = df_fx.sort_values("observation_date").set_index("observation_date")
    df_fx["DEXUSEU"] = pd.to_numeric(df_fx["DEXUSEU"], errors="coerce")

    df_clean = df_base.copy()
    df_clean["fx"] = df_fx["DEXUSEU"].reindex(df_clean.index)
    df_clean = df_clean[df_clean["fx"].notna()].copy()

    # --- US inflation ---
    df_infl_us = pd.read_csv(data_dir / "inflation_us.csv")
    df_infl_us["observation_date"] = pd.to_datetime(df_infl_us["observation_date"]).dt.normalize()
    df_infl_us = df_infl_us.sort_values("observation_date")
    df_infl_us["CPIAUCSL"] = pd.to_numeric(df_infl_us["CPIAUCSL"], errors="coerce")
    df_infl_us["inflation_mom"] = df_infl_us["CPIAUCSL"].pct_change() * 100
    df_infl_us = df_infl_us.dropna(subset=["inflation_mom"]).set_index("observation_date").sort_index()

    inflation_daily = df_infl_us["inflation_mom"].resample("D").ffill()
    inflation_daily.name = "inflation_us_mom"

    df_clean = df_clean.join(inflation_daily, how="left")
    df_clean["inflation_us_mom"] = df_clean["inflation_us_mom"].ffill()

    # --- EU inflation ---
    df_infl_eu = pd.read_csv(data_dir / "inflacion_eu.csv")
    df_infl_eu["DATE"] = pd.to_datetime(df_infl_eu["DATE"]).dt.normalize()
    df_infl_eu = df_infl_eu.sort_values("DATE")

    eu_col = "HICP Inflation rate - Total - Index (HICP.M.U2.N.000000.4D0.INX)"
    df_infl_eu[eu_col] = pd.to_numeric(df_infl_eu[eu_col], errors="coerce")
    df_infl_eu["inflation_mom"] = df_infl_eu[eu_col].pct_change() * 100
    df_infl_eu = df_infl_eu.dropna(subset=["inflation_mom"]).set_index("DATE").sort_index()

    infl_eu_daily = df_infl_eu["inflation_mom"].resample("D").ffill()
    infl_eu_daily.name = "inflation_eu_mom"

    df_clean = df_clean.join(infl_eu_daily, how="left")
    df_clean["inflation_eu_mom"] = df_clean["inflation_eu_mom"].ffill()

    # --- US interest ---
    df_interest_us = pd.read_csv(data_dir / "Interes_USA.csv")
    df_interest_us["Date"] = pd.to_datetime(df_interest_us["Date"], errors="coerce")
    df_interest_us["Value"] = pd.to_numeric(df_interest_us["Value"], errors="coerce")
    df_interest_us = df_interest_us.dropna(subset=["Date"]).sort_values("Date").set_index("Date")
    df_interest_us["interest_us"] = df_interest_us["Value"]

    df_clean = df_clean.join(df_interest_us["interest_us"], how="left")
    df_clean["interest_us"] = df_clean["interest_us"].ffill()

    # --- EU interest ---
    df_interest_eu = pd.read_csv(data_dir / "interes.csv")
    df_interest_eu["DATE"] = pd.to_datetime(df_interest_eu["DATE"]).dt.normalize()
    df_interest_eu = df_interest_eu.sort_values("DATE").set_index("DATE")

    rate_eu_col = "Long-term interest rate for convergence purposes - Euro (IRS.M.U2.L.L40.CI.0000.EUR.N.Z)"
    df_interest_eu[rate_eu_col] = pd.to_numeric(df_interest_eu[rate_eu_col], errors="coerce")

    rate_eu_daily = df_interest_eu[rate_eu_col].resample("D").ffill()
    rate_eu_daily.name = "rate_eu"

    df_clean = df_clean.join(rate_eu_daily, how="left")
    df_clean["rate_eu"] = df_clean["rate_eu"].ffill()

    # --- engineered features ---
    df_clean["spread_rates"] = df_clean["interest_us"] - df_clean["rate_eu"]
    df_clean = df_clean.drop(columns=["interest_us", "rate_eu"])

    df_clean["log_return"] = np.log(df_clean["fx"] / df_clean["fx"].shift(1))
    df_clean["ret_lag1"] = df_clean["log_return"].shift(1)
    df_clean["ret_lag2"] = df_clean["log_return"].shift(2)
    df_clean["vix_change"] = df_clean["vix"].pct_change()

    df_model = df_clean.dropna().copy()
    df_model["fx_volatility_10d"] = df_model["fx"].rolling(10).std()
    df_model = df_model.dropna().copy()

    return df_model


def prepare_supervised_data(df_model: pd.DataFrame):
    df_sup = df_model.copy()

    for col in TARGETS:
        df_sup[f"y_{col}"] = df_sup[col].shift(-1)

    y_cols = [f"y_{col}" for col in TARGETS]
    df_sup = df_sup[FEATURES + y_cols].dropna().copy()

    X = df_sup[FEATURES]
    Y = df_sup[y_cols]

    split = int(len(df_sup) * 0.8)
    X_train, X_test = X.iloc[:split].copy(), X.iloc[split:].copy()
    Y_train, Y_test = Y.iloc[:split].copy(), Y.iloc[split:].copy()

    return X_train, X_test, Y_train, Y_test


def train_xgboost_model(X_train: pd.DataFrame, Y_train: pd.DataFrame) -> MultiOutputRegressor:
    base = XGBRegressor(
        n_estimators=500,
        max_depth=3,
        learning_rate=0.03,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
    )
    model = MultiOutputRegressor(base)
    model.fit(X_train, Y_train)
    return model


def build_monthly_references(df_model: pd.DataFrame):
    infl_us_ref = df_model["inflation_us_mom"].resample("M").last()
    infl_eu_ref = df_model["inflation_eu_mom"].resample("M").last()
    spread_ref = df_model["spread_rates"].resample("M").last()
    return infl_us_ref, infl_eu_ref, spread_ref


def get_monthly_value(ref_series: pd.Series, next_date: pd.Timestamp, current_value: float) -> float:
    month_end = pd.Timestamp(next_date).to_period("M").to_timestamp("M")
    if month_end in ref_series.index:
        return float(ref_series.loc[month_end])
    return float(current_value)


def forecast_to_date(
    df_model: pd.DataFrame,
    model: MultiOutputRegressor,
    target_date: str,
    infl_us_ref: pd.Series,
    infl_eu_ref: pd.Series,
    spread_ref: pd.Series,
) -> pd.DataFrame:
    df_future = df_model.copy()
    target_date = pd.to_datetime(target_date).normalize()
    current_date = df_future.index.max()

    while current_date < target_date:
        X_current = df_future.loc[[current_date], FEATURES]
        y_pred = model.predict(X_current)[0]

        next_date = current_date + pd.Timedelta(days=1)

        new_row = {}
        for i, col in enumerate(TARGETS):
            new_row[col] = y_pred[i]

        fx_today = df_future.loc[current_date, "fx"]
        log_return_next = new_row["log_return"]
        fx_next = fx_today * np.exp(log_return_next)
        new_row["fx"] = fx_next

        new_row["ret_lag2"] = df_future.loc[current_date, "ret_lag1"]
        new_row["ret_lag1"] = log_return_next

        vix_today = df_future.loc[current_date, "vix"]
        vix_next = new_row["vix"]
        new_row["vix_change"] = 0.0 if pd.isna(vix_today) or vix_today == 0 else (vix_next - vix_today) / vix_today

        new_row["inflation_us_mom"] = get_monthly_value(
            infl_us_ref, next_date, df_future.loc[current_date, "inflation_us_mom"]
        )
        new_row["inflation_eu_mom"] = get_monthly_value(
            infl_eu_ref, next_date, df_future.loc[current_date, "inflation_eu_mom"]
        )
        new_row["spread_rates"] = get_monthly_value(
            spread_ref, next_date, df_future.loc[current_date, "spread_rates"]
        )

        df_future.loc[next_date] = new_row
        df_future.loc[next_date, "fx_volatility_10d"] = df_future["fx"].rolling(10).std().loc[next_date]

        current_date = next_date

    return df_future


def get_min_fx_from_last_train(df_model: pd.DataFrame, df_projection: pd.DataFrame) -> dict:
    last_train_date = df_model.index.max()
    df_future = df_projection[df_projection.index > last_train_date]

    min_value = df_future["fx"].min()
    min_date = df_future["fx"].idxmin()

    return {
        "min_fx": float(min_value),
        "date": pd.to_datetime(min_date),
    }