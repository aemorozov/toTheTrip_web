import { NextResponse } from "next/server";
import { resolveCitiesBatch } from "../../../lib/resolveCitiesBatch";

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

  const json = await res.json();

  if (!json?.data) {
    return NextResponse.json({ data: [] });
  }

  const codes = [origin, ...json.data.map((f: any) => f.destination)];

  const cityMap = await resolveCitiesBatch(codes);

  const enrichedFlights = json.data.map((flight: any) => ({
    ...flight,
    originCity: cityMap[origin] || origin,
    destinationCity: cityMap[flight.destination] || flight.destination,
  }));

  return NextResponse.json({ data: enrichedFlights });
}
