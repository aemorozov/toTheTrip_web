import { NextResponse } from "next/server";
import { resolveCitiesBatch } from "../../../lib/resolveCitiesBatch";

const DEFAULT_ORIGINS = [
  "LON",
  "PAR",
  "BER",
  "MAD",
  "ROM",
  "AMS",
  "VIE",
  "PRG",
  "ATH",
  "IST",
  "WAW",
  "LIS",
  "DUB",
  "ZRH",
  "CPH",
  "OSL",
  "HEL",
  "BUH",
  "RIX",
];

type ApiFlight = {
  origin: string;
  destination: string;
  departure_at: string;
  return_at?: string;
  price: number;
};

function shuffle<T>(items: T[]): T[] {
  return [...items]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

async function loadFlightsByOrigin(origin: string): Promise<ApiFlight[]> {
  try {
    const params = new URLSearchParams({
      currency: "eur",
      origin,
      unique: "true",
      sorting: "price",
      direct: "true",
      one_way: "true",
      limit: "1",
      token: process.env.TRAVELPAYOUTS_API_TOKEN as string,
    });

    const res = await fetch(
      `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`,
      { next: { revalidate: 1800 } },
    );

    if (!res.ok) return [];

    const json = await res.json();
    if (!Array.isArray(json?.data)) return [];

    return json.data;
  } catch {
    return [];
  }
}

export async function GET() {
  const selectedOrigins = shuffle(DEFAULT_ORIGINS).slice(0, 10);
  const flightChunks = await Promise.all(
    selectedOrigins.map(loadFlightsByOrigin),
  );

  const extraFlights = shuffle(flightChunks.flat()).slice(0, 10);

  if (!extraFlights.length) {
    return NextResponse.json({ data: [] });
  }

  const allCodes = new Set<string>();
  extraFlights.forEach((flight) => {
    allCodes.add(flight.origin);
    allCodes.add(flight.destination);
  });

  const cityMap = await resolveCitiesBatch(Array.from(allCodes));

  const enrichedFlights = extraFlights.map((flight) => ({
    ...flight,
    originCity: cityMap[flight.origin] || flight.origin,
    destinationCity: cityMap[flight.destination] || flight.destination,
  }));

  return NextResponse.json({ data: enrichedFlights });
}
