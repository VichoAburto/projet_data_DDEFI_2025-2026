import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    pair: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { pair } = await params;

    const backendUrl = process.env.API_BASE_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "API_BASE_URL is not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(`${backendUrl}/fx/${pair}/history`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Frontend API route error:", error);

    return NextResponse.json(
      { error: "Failed to fetch FX history from backend" },
      { status: 500 }
    );
  }
}