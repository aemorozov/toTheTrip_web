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

type Props = {
  origin: string;
  oneWay: boolean;
};

export default function FlightsMainBlock({ origin, oneWay }: Props) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const link = oneWay
    ? "/api/oneWayFlights?origin="
    : "/api/roundTripFlights?origin=";

  useEffect(() => {
    fetch(`${link}` + `${origin}`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setFlights(data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [origin]);

  if (loading) {
    return (
      <section className={styles.flightBlock}>
        <p>Loading data...</p>
      </section>
    );
  }
  if (!flights.length) return <p>No cheap flights found.</p>;

  return (
    <section className={styles.flightBlock}>
      <h2 className={styles.h2}>
        <span className={styles.h2orange}>
          {oneWay ? "One way" : "Round trip"}
        </span>{" "}
        cheapest flights
      </h2>
      <div className={styles.flightSection}>
        {flights.map((flight, index) => (
          <FlightBlock flight={flight} key={index} />
        ))}
      </div>
    </section>
  );
}
