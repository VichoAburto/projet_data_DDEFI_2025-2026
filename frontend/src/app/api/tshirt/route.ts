import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.API_BASE_URL}/tshirt`, {
    cache: "no-store", // optional
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Backend error" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
