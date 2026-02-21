import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");

  if (!origin) {
    return NextResponse.json({ error: "Missing origin" }, { status: 400 });
  }

  const params = new URLSearchParams({
    currency: "eur",
    origin,
    unique: "true",
    sorting: "price",
    direct: "true",
    one_way: "true",
    limit: "10",
    token: process.env.TRAVELPAYOUTS_API_TOKEN as string,
  });

  const res = await fetch(
    `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`,
  );

  const data = await res.json();

  return NextResponse.json(data);
}
