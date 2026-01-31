"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Point = { t: number; rate: number }; // t = unix ms timestamp

const PAIRS = [
  { pair: "EURUSD", title: "EUR/USD", subtitle: "Euro to US Dollar" },
  { pair: "EURBRL", title: "EUR/BRL", subtitle: "Euro to Brazilian Real" },
  { pair: "EURCLP", title: "EUR/CLP", subtitle: "Euro to Chilean Peso" },
] as const;

type RangeKey = "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y" | "MAX";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "6M", label: "6M" },
  { key: "1Y", label: "1Y" },
  { key: "5Y", label: "5Y" },
  { key: "MAX", label: "Max" },
];

// Demo data generator (replace with your API later)
function makeDemoSeries(days: number, start: number): Point[] {
  const now = Date.now();
  const points: Point[] = [];

  let v = start;
  for (let d = days; d >= 0; d -= 1) {
    v += (Math.random() - 0.5) * 0.01;
    points.push({ t: now - d * 24 * 60 * 60 * 1000, rate: v });
  }
  return points;
}

// pretend each pair has its own history
function getPairSeries(pair: string): Point[] {
  switch (pair) {
    case "EURUSD":
      return makeDemoSeries(365 * 10, 1.08);
    case "EURBRL":
      return makeDemoSeries(365 * 10, 5.4);
    case "EURCLP":
      return makeDemoSeries(365 * 10, 980);
    default:
      return makeDemoSeries(365 * 10, 1.0);
  }
}

function rangeToMs(range: RangeKey): number | null {
  const day = 24 * 60 * 60 * 1000;
  switch (range) {
    case "1D":
      return 1 * day;
    case "1W":
      return 7 * day;
    case "1M":
      return 30 * day;
    case "6M":
      return 182 * day;
    case "1Y":
      return 365 * day;
    case "5Y":
      return 365 * 5 * day;
    case "MAX":
      return null;
  }
}

function formatXAxis(ts: number) {
  const d = new Date(ts);
  // short format
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type CustomTooltipProps = {
  active?: boolean;
  label?: number;
  payload?: Array<{ value?: number }>;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  const value = payload[0]?.value;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow">
      <div className="text-xs text-muted-foreground">
        {new Date(label).toLocaleString()}
      </div>
      <div className="text-sm font-semibold text-foreground">
        {typeof value === "number" ? value.toFixed(4) : "--"}
      </div>
    </div>
  );
}

export default function PairPage() {
  const params = useParams<{ pair: string }>();
  const pairParam = (params?.pair ?? "EURUSD").toUpperCase();

  const pairMeta =
    PAIRS.find((p) => p.pair === pairParam) ??
    ({ pair: pairParam, title: pairParam, subtitle: "" } as const);

  const [range, setRange] = useState<RangeKey>("1M");
  const [fullSeries, setFullSeries] = useState<Point[]>([]);

  useEffect(() => {
    setFullSeries(getPairSeries(pairParam)); // runs only on client
  }, [pairParam]);

  // ✅ IMPORTANT: all hooks (including useMemo) must run before any early return
  const filtered = useMemo(() => {
    const windowMs = rangeToMs(range);

    if (!windowMs) {
      return fullSeries.map((p) => ({ ...p, dateLabel: formatXAxis(p.t) }));
    }

    const cutoff = Date.now() - windowMs;
    return fullSeries
      .filter((p) => p.t >= cutoff)
      .map((p) => ({ ...p, dateLabel: formatXAxis(p.t) }));
  }, [fullSeries, range]);

  // ✅ NOW it's safe to early-return
  if (!fullSeries.length) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-5xl mx-auto w-full">
          <p className="text-muted-foreground">Loading chart…</p>
        </div>
      </div>
    );
  }

  const currentRate = filtered.length ? filtered[filtered.length - 1].rate : 0;
  const firstRate = filtered.length ? filtered[0].rate : 0;

  const changePct =
    firstRate === 0 ? 0 : ((currentRate - firstRate) / firstRate) * 100;
  const isPositive = changePct >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#0e141b] to-[#0b0f14]">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Top bar: pair menu */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {pairMeta.title}
            </h1>
            <span className="text-muted-foreground text-lg">
              {pairMeta.subtitle}
            </span>
          </div>

          {/* Simple pair menu as links */}
          <div className="flex flex-wrap gap-2">
            {PAIRS.map((p) => (
              <Link
                key={p.pair}
                href={`/pair/${p.pair}`}
                className={`px-3 py-1.5 rounded-xl border text-sm ${
                  p.pair === pairParam
                    ? "border-teal-300 bg-teal-400/25 text-white"
                    : "border-white/30 text-white/80 hover:border-white/60 hover:text-white"
                }`}
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-4">
          <span className="text-4xl md:text-5xl font-bold text-foreground">
            {Number.isFinite(currentRate) ? currentRate.toFixed(4) : "--"}
          </span>

          <span
            className={`text-lg font-medium ${
              isPositive ? "text-primary" : "text-destructive"
            }`}
          >
            {isPositive ? "+" : ""}
            {changePct.toFixed(2)}%
          </span>
        </div>

        {/* Range buttons */}
        <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => {
                const selected = range === r.key;

                return (
                <button
                    key={r.key}
                    onClick={() => setRange(r.key)}
                    type="button"
                    className={[
                    "px-4 py-2 rounded-full border text-sm transition",
                    selected
                        ? "border-teal-300 bg-teal-400/25 text-white"
                        : "border-white/30 text-white/80 hover:border-white/60 hover:text-white"
                    ].join(" ")}
                >
                    {r.label}
                </button>
                );
            })}
        </div>

        {/* Chart */}
        <div
          className="bg-card rounded-2xl border border-border p-6"
          style={{ height: "500px" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filtered}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(174, 72%, 50%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(174, 72%, 50%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 15%, 20%)"
                vertical={false}
              />

              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v: number) => formatXAxis(v)}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }}
                dx={-10}
                tickFormatter={(v: number) =>
                  Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)
                }
              />

              <Tooltip
                labelFormatter={(label) => Number(label)}
                content={<CustomTooltip />}
              />

              <Area
                type="monotone"
                dataKey="rate"
                stroke="hsl(174, 72%, 50%)"
                strokeWidth={2}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}