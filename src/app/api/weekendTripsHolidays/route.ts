import { NextResponse } from "next/server";
import { resolveCitiesBatch } from "../../../lib/resolveCitiesBatch";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const countryCode = searchParams.get("countryCode");

  if (!year || !countryCode) {
    return NextResponse.json({ error: "Missing origin" }, { status: 400 });
  }

  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
  );

  const json = await res.json();

  return NextResponse.json({ json });
}
