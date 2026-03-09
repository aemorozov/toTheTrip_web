"use client";

import { useEffect, useState } from "react";
import styles from "./FlightsMainBlock.module.css";
import FlightBlock from "../FlightBlock/FlightBlock";
import { DateTime } from "luxon";

type Flight = {
  destination: string;
  departure_at: string;
  return_at: string;
  price: number;
  airline: string;
  flight_number: number;
  destinationCity?: string;
  originCity?: string;
};

type ApiResponse = {
  data: Flight[];
};

type Props = {
  origin: string;
  parameters: string;
};

export default function FlightsMainBlock({ origin, parameters }: Props) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const oneWay = parameters === "oneWay" ? true : false;
  const roundTrip = parameters === "roundTrip" ? true : false;
  const weekendTrips = parameters === "weekendTrips" ? true : false;

  var link = ""; // link for API
  oneWay ? (link = "/api/oneWayFlights?origin=") : null;
  roundTrip ? (link = "/api/roundTripFlights?origin=") : null;
  weekendTrips ? (link = "/api/weekendTripsFlights?origin=") : null;

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setFlights([]);
        const res = await fetch(`${link}${origin}`);
        const data: ApiResponse = await res.json();
        let result = data?.data || [];
        if (weekendTrips) {
          result = await searchWeekendTrips(result, origin);
        }
        setFlights(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadFlights(); // for async functions
  }, [origin, weekendTrips]);

  const emptyFlights = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // loading empty blocks

  if (loading) {
    return (
      <div className={styles.flightBlock}>
        <h2 className={styles.h2}>
          {oneWay ? (
            <>
              <span className={styles.h2orange}>One way</span> cheapest flights
            </>
          ) : null}
          {roundTrip ? (
            <>
              <span className={styles.h2orange}>Round trip</span> cheapest
              flights
            </>
          ) : null}
          {weekendTrips ? (
            <>
              <span className={styles.h2orange}>Weekend</span> trips
            </>
          ) : null}
        </h2>
        <div className={styles.flightSection}>
          {emptyFlights.map((index) => (
            <div className={styles.emptyFlight} key={index}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!flights.length)
    return <p className={styles.noFlights}>Oops! 😕 No cheap flights found.</p>;

  const limitedFlights = flights.slice(0, 10);

  return (
    <div className={styles.flightBlock}>
      <h2 className={styles.h2}>
        {oneWay ? (
          <>
            <span className={styles.h2orange}>One way</span> cheapest flights
          </>
        ) : null}
        {roundTrip ? (
          <>
            <span className={styles.h2orange}>Round trip</span> cheapest flights
          </>
        ) : null}
        {weekendTrips ? (
          <>
            <span className={styles.h2orange}>Weekend</span> trips
          </>
        ) : null}
      </h2>
      <div className={styles.flightSection}>
        {limitedFlights.map((flight, index) => (
          <FlightBlock flight={flight} key={index} />
        ))}
      </div>
    </div>
  );
}

// weekends and holidays filter
async function searchWeekendTrips(
  flights: Flight[],
  origin: string,
): Promise<Flight[]> {
  if (!Array.isArray(flights) || flights.length === 0) {
    return [];
  }

  try {
    /* 1️⃣ COUNTRY BY ORIGIN */

    const controller = new AbortController();

    const placesRes = await fetch(
      `/api/places?term=${encodeURIComponent(origin)}&locale=en`,
      { signal: controller.signal },
    );

    if (!placesRes.ok) return [];

    const places = await placesRes.json();

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
            `/api/weekendTripsHolidays?year=${year}&countryCode=${countryCode}`,
            {
              signal: controller.signal,
            },
          );
          if (!res.ok) return [];
          return await res.json();
        } catch {
          return [];
        }
      }),
    );

    const holidayDates = holidayResponses.flatMap((item) => item.json);

    const holidaySet = new Set(
      holidayDates.map((h) => {
        const iso = DateTime.fromISO(h.date).startOf("day").toISODate();
        return iso;
      }),
    );

    const isHolidayTrip = (d: DateTime, r: DateTime) => {
      const check = (date: DateTime, label: string) => {
        const base = date.startOf("day");

        const current = base.toISODate();
        const minus1 = base.minus({ days: 1 }).toISODate();
        const plus1 = base.plus({ days: 1 }).toISODate();

        const currentMatch = holidaySet.has(current);
        const minusMatch = holidaySet.has(minus1);
        const plusMatch = holidaySet.has(plus1);

        return currentMatch || minusMatch || plusMatch;
      };

      const departMatch = check(d, "DEPART");
      const returnMatch = check(r, "RETURN");

      const finalResult = departMatch || returnMatch;

      return finalResult;
    };

    // Check time windows

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

    return flights
      .filter((t) => {
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
      })
      .sort((a, b) => {
        const aDate = DateTime.fromISO(a.departure_at);
        const bDate = DateTime.fromISO(b.departure_at);

        return aDate.toMillis() - bDate.toMillis();
      });
  } catch (error) {
    console.error("searchWeekendTrips error:", error);
    return [];
  }
}
