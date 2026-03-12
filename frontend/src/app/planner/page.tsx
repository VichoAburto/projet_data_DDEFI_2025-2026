"use client";

import React, { useMemo, useState } from "react";
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

type Currency = "USD" | "BRL" | "CLP";

type ForecastPoint = {
  date: string;
  timestamp: number;
  rate: number;
};

const CURRENCIES: {
  code: Currency;
  label: string;
  description: string;
  baseRate: number;
  volatility: number;
}[] = [
  {
    code: "USD",
    label: "US Dollar → Euro",
    description: "Estimate the best day to convert USD into EUR.",
    baseRate: 1.15,
    volatility: 0.01,
  },
  {
    code: "BRL",
    label: "Brazilian Real → Euro",
    description: "Estimate the best day to convert BRL into EUR.",
    baseRate: 6.2,
    volatility: 0.05,
  },
  {
    code: "CLP",
    label: "Chilean Peso → Euro",
    description: "Estimate the best day to convert CLP into EUR.",
    baseRate: 1055,
    volatility: 8,
  },
];

function formatShortDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatLongDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildFakeForecast(currency: Currency): ForecastPoint[] {
  const config = CURRENCIES.find((c) => c.code === currency)!;
  const today = new Date();
  const points: ForecastPoint[] = [];

  let current = config.baseRate;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const wave1 = Math.sin(i / 4) * config.volatility * 1.4;
    const wave2 = Math.cos(i / 7) * config.volatility * 0.8;
    const trend =
      currency === "USD"
        ? -i * config.volatility * 0.015
        : currency === "BRL"
        ? i * config.volatility * 0.02
        : Math.sin(i / 9) * config.volatility * 0.5;

    current = config.baseRate + wave1 + wave2 + trend;

    points.push({
      date: date.toISOString(),
      timestamp: date.getTime(),
      rate: Number(current.toFixed(currency === "CLP" ? 2 : 4)),
    });
  }

  return points;
}

function getBestDay(points: ForecastPoint[]) {
  return points.reduce((best, current) =>
    current.rate < best.rate ? current : best
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: number;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="text-xs text-slate-500">{formatLongDate(label)}</div>
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
  const [hasCalculated, setHasCalculated] = useState(false);

  const forecast = useMemo(() => buildFakeForecast(currency), [currency]);
  const bestDay = useMemo(() => getBestDay(forecast), [forecast]);
  const selectedConfig = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700 mb-3">
            Exchange Planner
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Find the best predicted day to exchange into euros
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Select a currency and calculate the most favorable predicted date,
            within the next 30 days, to convert your money into EUR.
          </p>
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
                onChange={(e) => {
                  setCurrency(e.target.value as Currency);
                  setHasCalculated(false);
                }}
                className="w-full md:w-80 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500"
              >
                {CURRENCIES.map((item) => (
                  <option key={item.code} value={item.code}>
                    ({item.code}) {item.label}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-sm text-slate-500">
                {selectedConfig.description}
              </p>
            </div>

            <button
              onClick={() => setHasCalculated(true)}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
              type="button"
            >
              Calculate best date
            </button>
          </div>
        </div>

        {hasCalculated && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
              <p className="text-sm uppercase tracking-[0.16em] text-slate-500 mb-3">
                Best predicted date
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>

                  <div className="text-4xl md:text-5xl font-bold text-slate-900">
                    {formatLongDate(bestDay.timestamp)}
                  </div>
                </div>

                <div className="text-slate-600 text-lg">
                  Estimated exchange rate:{" "}
                  <span className="font-semibold text-slate-900">
                    {currency === "CLP"
                      ? bestDay.rate.toFixed(2)
                      : bestDay.rate.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
              style={{ height: "520px" }}
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  30-Day Exchange Rate Forecast
                </h2>
                <p className="text-slate-500 text-sm">
                  Predicted exchange rates for {currency} → EUR over the next month
                </p>
              </div>

              <ResponsiveContainer width="100%" height="88%">
                <AreaChart
                  data={forecast}
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
                    dataKey="timestamp"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(v: number) => formatShortDate(v)}
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
                      Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)
                    }
                  />

                  <Tooltip
                    labelFormatter={(label) => Number(label)}
                    content={<CustomTooltip />}
                  />

                  <ReferenceDot
                    x={bestDay.timestamp}
                    y={bestDay.rate}
                    r={6}
                    fill="#0f172a"
                    stroke="#14b8a6"
                    strokeWidth={2}
                  />

                  <Area
                    type="monotone"
                    dataKey="rate"
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