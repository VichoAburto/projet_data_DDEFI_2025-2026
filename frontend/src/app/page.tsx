"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tshirt")
      .then(res => res.json())
      .then(data => {
        console.log("API response:", data);
        router.push("/pair/EURUSD"); // redirect AFTER logging
      })
      .catch(err => console.error("API error:", err));
  }, [router]);

  return null;
}
