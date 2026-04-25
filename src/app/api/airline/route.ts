import { NextResponse } from "next/server";

type AirlineRecord = {
  code?: string;
  name?: string;
  name_translations?: {
    en?: string;
  };
};

let airlineCache: Map<string, string> | null = null;

async function getAirlineCache(): Promise<Map<string, string>> {
  if (airlineCache) {
    return airlineCache;
  }

  const res = await fetch("https://api.travelpayouts.com/data/en/airlines.json", {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    return new Map();
  }

  const data: AirlineRecord[] = await res.json();
  const cache = new Map<string, string>();

  for (const airline of data) {
    if (!airline.code) continue;
    const name = airline.name_translations?.en || airline.name;
    if (!name) continue;
    cache.set(airline.code.toUpperCase(), name);
  }

  airlineCache = cache;
  return cache;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ name: null }, { status: 400 });
  }

  const cache = await getAirlineCache();
  const name = cache.get(code) || null;

  return NextResponse.json({ name });
}
