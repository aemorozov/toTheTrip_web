import { DateTime } from "luxon";

/* ───────────────── TYPES ───────────────── */

export type Flight = {
  departure_at: string;
  return_at: string;
  price?: number;
  origin?: string;
  destination?: string;
};

/* ───────────────── MAIN FILTER FUNCTION ───────────────── */

export default async function searchWeekendTrips(
  flights: Flight[],
): Promise<Flight[]> {
  if (!Array.isArray(flights) || flights.length === 0) {
    return [];
  }

  try {
    /* 1️⃣ COUNTRY BY ORIGIN */

    const placesRes = await fetch(
      `https://autocomplete.travelpayouts.com/places2?term=${origin}&locale=en&types=city`,
    );

    if (!placesRes.ok) return [];

    const places: any[] = await placesRes.json();

    const countryCode: string | undefined =
      places?.[0]?.country_code || places?.[0]?.country;

    if (!countryCode) return [];

    /* 2️⃣ COLLECT YEARS */

    const yearSet = new Set<number>();

    flights.forEach((f) => {
      yearSet.add(DateTime.fromISO(f.departure_at).year);
      yearSet.add(DateTime.fromISO(f.return_at).year);
    });

    const years = Array.from(yearSet);

    /* 3️⃣ LOAD HOLIDAYS */

    const holidayResponses = await Promise.all(
      years.map(async (year) => {
        try {
          const res = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
          );
          if (!res.ok) return [];
          return await res.json();
        } catch {
          return [];
        }
      }),
    );

    const holidaySet = new Set<string>(
      holidayResponses
        .flat()
        .map((h: any) => DateTime.fromISO(h.date).startOf("day").toISODate()),
    );

    /* 4️⃣ HELPERS */

    const isHolidayTrip = (d: DateTime, r: DateTime): boolean => {
      const check = (date: DateTime) => {
        const base = date.startOf("day");
        return (
          holidaySet.has(base.toISODate()) ||
          holidaySet.has(base.minus({ days: 1 }).toISODate()) ||
          holidaySet.has(base.plus({ days: 1 }).toISODate())
        );
      };
      return check(d) || check(r);
    };

    const isDepartInWeekendWindow = (d: DateTime): boolean =>
      (d.weekday === 5 && d.hour >= 20) ||
      d.weekday === 6 ||
      (d.weekday === 7 && d.hour < 12);

    const isReturnInWeekendWindow = (r: DateTime): boolean =>
      (r.weekday === 7 && r.hour > 6) ||
      r.weekday === 1 ||
      (r.weekday === 2 && r.hour < 2);

    const isWeekRelationOk = (d: DateTime, r: DateTime): boolean => {
      const departWeekEnd = d.endOf("week");
      const nextWeekEnd = departWeekEnd.plus({ weeks: 1 });

      if (r.weekday === 7) return r <= departWeekEnd;
      if (r.weekday === 1 || r.weekday === 2)
        return r > departWeekEnd && r <= nextWeekEnd;

      return false;
    };

    /* 5️⃣ FILTER */

    return flights.filter((t) => {
      const depart = DateTime.fromISO(t.departure_at, { setZone: true });
      const ret = DateTime.fromISO(t.return_at, { setZone: true });

      if (!depart.isValid || !ret.isValid) return false;

      const durationHours = ret.diff(depart, "hours").hours;
      const durationOk = durationHours >= 26 && durationHours <= 96;

      const weekendTrip =
        isDepartInWeekendWindow(depart) &&
        isReturnInWeekendWindow(ret) &&
        isWeekRelationOk(depart, ret);

      const holidayTrip = isHolidayTrip(depart, ret);

      return durationOk && (weekendTrip || holidayTrip);
    });
  } catch (error) {
    console.error("searchWeekendTrips error:", error);
    return [];
  }
}
