"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import PageHeader from "@/components/PageHeader";

type Currency = "USD" | "BRL" | "CLP";

type ForecastPoint = {
  date: string;
  fx: number;
};

type PlannerResponse = {
  currency: string;
  supported: boolean;
  best_date: string;
  best_fx: number;
  current_date: string;
  forecast: ForecastPoint[];
};

const CURRENCIES = [
  {
    code: "USD" as Currency,
    label: "US Dollar → Euro",
    description: "Estimate the best day to convert USD into EUR.",
  },
  {
    code: "BRL" as Currency,
    label: "Brazilian Real → Euro",
    description: "Estimate the best day to convert BRL into EUR.",
  },
  {
    code: "CLP" as Currency,
    label: "Chilean Peso → Euro",
    description: "Estimate the best day to convert CLP into EUR.",
  },
];

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="text-xs text-slate-500">{formatDate(label)}</div>
      <div className="text-sm font-semibold text-slate-900">
        {typeof payload[0]?.value === "number"
          ? payload[0].value.toFixed(4)
          : "--"}
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedConfig = CURRENCIES.find((c) => c.code === currency)!;

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/planner/best-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency,
          days_ahead: 30,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to calculate best date");
    } finally {
      setLoading(false);
    }
  }

  const chartData =
    result?.forecast.map((point) => ({
      ...point,
      timestamp: new Date(point.date).getTime(),
    })) ?? [];

  const bestPoint = result
    ? chartData.find((point) => point.date === result.best_date)
    : null;

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div>
          <PageHeader
            eyebrow="Exchange Planner"
            title="Find the best predicted day to exchange into euros"
            description="Select a currency and calculate the most favorable predicted date within the next 30 days to convert your money into EUR."
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Choose your currency
              </label>

              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full md:w-80 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
              >
                {CURRENCIES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} — {item.label}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-sm text-slate-500">
                {selectedConfig.description}
              </p>
            </div>

            <button
              onClick={handleCalculate}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition disabled:opacity-60"
              type="button"
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate best date"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        {result && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 shadow-sm p-6 md:p-8">
              <p className="text-sm uppercase tracking-[0.16em] text-slate-500 mb-3">
                Best predicted date
              </p>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <div className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                  {formatDate(result.best_date)}
                </div>
              </div>

              <div className="text-slate-600 text-lg">
                Predicted exchange rate:{" "}
                <span className="font-semibold text-slate-900">
                  {result.best_fx.toFixed(4)}
                </span>
              </div>

              <div className="mt-2 text-sm text-slate-500">
                Current day: {result.current_date}
              </div>
            </div>

            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
              style={{ height: "520px" }}
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  30-Day Forecast
                </h2>
                <p className="text-slate-500 text-sm">
                  Predicted path for {result.currency} → EUR
                </p>
              </div>

              <ResponsiveContainer width="100%" height="88%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="plannerGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#d6d3d1"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => formatShortDate(v)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />

                  <YAxis
                    domain={["auto", "auto"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dx={-10}
                    tickFormatter={(v: number) =>
                      Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(4)
                    }
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {bestPoint && (
                    <ReferenceDot
                      x={bestPoint.date}
                      y={bestPoint.fx}
                      r={6}
                      fill="#0f172a"
                      stroke="#14b8a6"
                      strokeWidth={2}
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="fx"
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    fill="url(#plannerGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}