"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-slate-800 bg-[#10233b] text-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-white"
        >
          <Image
            src="/icon.png"
            alt="FX Predictor logo"
            width={0}
            height={0}
            sizes="100vw"
            className="h-10 w-auto"
          />
          <span className="font-semibold text-xl tracking-tight">
            FX Predictor
          </span>
        </Link>

        <div className="flex items-center gap-6 text-base text-white/80">
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