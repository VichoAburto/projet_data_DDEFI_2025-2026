"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-slate-800 bg-[#10233b] text-white">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          FX Predictor
        </Link>

        <div className="flex items-center gap-6 text-sm text-white/80">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>

          <Link href="/pair/EURUSD" className="hover:text-white transition">
            FX Pairs
          </Link>

          <Link href="/planner" className="hover:text-white transition">
            Planner
          </Link>

          <Link href="/about" className="hover:text-white transition">
            About Us
          </Link>
        </div>
      </div>
    </nav>
  );
}