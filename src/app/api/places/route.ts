import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term");

  if (!term) {
    return NextResponse.json([], { status: 400 });
  }

  const res = await fetch(
    `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
      term,
    )}&locale=en&types[]=city&types[]=airport`,
  );

  const data = await res.json();

  return NextResponse.json(data);
}
