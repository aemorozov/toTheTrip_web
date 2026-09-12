import { NextResponse } from "next/server";
import { resolveCitiesBatch } from "../../../lib/resolveCitiesBatch";

type TripType = "oneWay" | "roundTrip" | "weekendTrips";
type Duration = "short" | "week" | "weekend";

const validTrips = new Set<TripType>([
  "oneWay",
  "roundTrip",
  "weekendTrips",
]);
const validDurations = new Set<Duration>(["short", "week", "weekend"]);

type Flight = {
  departure_at: string;
  return_at?: string;
  destination: string;
  [key: string]: unknown;
};

function isMonth(value: string | null): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

function tripLengthInDays(flight: Flight): number | null {
  if (!flight.return_at) return null;

  const departureDate = flight.departure_at.slice(0, 10);
  const returnDate = flight.return_at.slice(0, 10);
  const departure = Date.parse(`${departureDate}T00:00:00Z`);
  const returnFlight = Date.parse(`${returnDate}T00:00:00Z`);

  if (Number.isNaN(departure) || Number.isNaN(returnFlight)) return null;
  return (returnFlight - departure) / 86_400_000;
}

function isWeekendTrip(flight: Flight): boolean {
  if (!flight.return_at) return false;

  const departure = new Date(`${flight.departure_at.slice(0, 10)}T00:00:00Z`);
  const returnFlight = new Date(`${flight.return_at.slice(0, 10)}T00:00:00Z`);
  const duration = tripLengthInDays(flight);

  if (Number.isNaN(departure.getTime()) || Number.isNaN(returnFlight.getTime())) {
    return false;
  }

  const departsOnWeekend = departure.getUTCDay() === 5 || departure.getUTCDay() === 6;
  const returnsByMonday =
    returnFlight.getUTCDay() === 0 || returnFlight.getUTCDay() === 1;

  return Boolean(duration && duration >= 1 && duration <= 4 && departsOnWeekend && returnsByMonday);
}

function matchesDuration(flight: Flight, duration: Duration | null): boolean {
  if (!duration) return true;
  if (duration === "weekend") return isWeekendTrip(flight);

  const tripLength = tripLengthInDays(flight);
  if (tripLength === null) return false;
  if (duration === "short") return tripLength >= 2 && tripLength <= 3;
  return tripLength >= 4 && tripLength <= 7;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");
  const requestedTrip = searchParams.get("trip");
  const trip: TripType = validTrips.has(requestedTrip as TripType)
    ? (requestedTrip as TripType)
    : "oneWay";
  const month = searchParams.get("month");
  const requestedDuration = searchParams.get("duration");
  const duration: Duration | null = validDurations.has(requestedDuration as Duration)
    ? (requestedDuration as Duration)
    : null;

  if (!origin) {
    return NextResponse.json({ error: "Missing origin" }, { status: 400 });
  }

  const params = new URLSearchParams({
    currency: "eur",
    origin,
    unique: "true",
    sorting: "price",
    direct: "true",
    one_way: String(trip === "oneWay"),
    limit: "1000",
    token: process.env.TRAVELPAYOUTS_API_TOKEN as string,
  });

  if (isMonth(month)) params.set("departure_at", month);

  const res = await fetch(
    `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`,
  );

  if (!res.ok) {
    return NextResponse.json({ data: [] }, { status: res.status });
  }

  const json = await res.json();
  const flights: Flight[] = Array.isArray(json?.data) ? json.data : [];
  const filteredFlights =
    trip === "oneWay" ? flights : flights.filter((flight) => matchesDuration(flight, duration));

  const codes = [origin, ...filteredFlights.map((flight) => flight.destination)];
  const cityMap = await resolveCitiesBatch(codes);

  const enrichedFlights = filteredFlights.map((flight) => ({
    ...flight,
    originCity: cityMap[origin] || origin,
    destinationCity: cityMap[flight.destination] || flight.destination,
  }));

  return NextResponse.json({ data: enrichedFlights });
}
