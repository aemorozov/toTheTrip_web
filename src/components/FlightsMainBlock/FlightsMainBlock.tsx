"use client";

import { useEffect, useState } from "react";
import styles from "./FlightsMainBlock.module.css";
import FlightBlock from "../FlightBlock/FlightBlock";

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

type Duration = "short" | "week" | "weekend";

type Props = {
  origin: string;
  parameters: "oneWay" | "roundTrip" | "weekendTrips";
  month: string | null;
  duration: Duration | null;
};

export default function FlightsMainBlock({
  origin,
  parameters,
  month,
  duration,
}: Props) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const oneWay = parameters === "oneWay";
  const roundTrip = parameters === "roundTrip";

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        setFlights([]);

        const query = new URLSearchParams({ origin, trip: parameters });
        if (month) query.set("month", month);
        if (duration) query.set("duration", duration);

        const res = await fetch(`/api/flights?${query}`);
        const data: ApiResponse = await res.json();
        setFlights(data?.data || []);
      } catch (error) {
        console.error(error);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, [duration, month, origin, parameters]);

  const emptyFlights = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const heading = oneWay ? (
    <>
      <span className={styles.h2orange}>One way</span> cheapest flights
    </>
  ) : roundTrip ? (
    <>
      <span className={styles.h2orange}>Round trip</span> cheapest flights
    </>
  ) : (
    <>
      <span className={styles.h2orange}>Weekend</span> trips
    </>
  );

  if (loading) {
    return (
      <div className={styles.flightBlock} id={parameters}>
        <h2 className={styles.h2}>{heading}</h2>
        <div className={styles.flightSection}>
          {emptyFlights.map((index) => (
            <div className={styles.emptyFlight} key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!flights.length) {
    return (
      <div className={styles.flightBlock} id={parameters}>
        <h2 className={styles.h2}>{heading}</h2>
        <p className={styles.noFlights}>Oops! No cheap flights found.</p>
      </div>
    );
  }

  return (
    <div className={styles.flightBlock} id={parameters}>
      <h2 className={styles.h2}>{heading}</h2>
      <div className={styles.flightSection}>
        {flights.slice(0, 10).map((flight, index) => (
          <FlightBlock flight={flight} key={index} />
        ))}
      </div>
    </div>
  );
}
