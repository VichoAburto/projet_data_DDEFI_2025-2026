import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl = process.env.API_BASE_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "API_BASE_URL is not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(`${backendUrl}/planner/best-day`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Planner route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch planner result from backend" },
      { status: 500 }
    );
  }
}
