"use client";

import { useEffect, useState } from "react";
import FlightBlock from "../FlightBlock/FlightBlock";
import styles from "./RandomFlightsBlock.module.css";

type Flight = {
  destination: string;
  departure_at: string;
  return_at: string;
  price: number;
  destinationCity?: string;
  originCity?: string;
};

type ApiResponse = {
  data: Flight[];
};

const emptyFlights = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function RandomFlightsBlock() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlights = async () => {
      try {
        const res = await fetch("/api/randomFlights");
        const data: ApiResponse = await res.json();
        setFlights((data?.data || []).slice(0, 10));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, []);

  if (loading) {
    return (
      <section className={styles.flightBlock}>
        <h2 className={styles.h2}>
          <span className={styles.h2orange}>Special</span> offers
        </h2>
        <div className={styles.flightSection}>
          {emptyFlights.map((index) => (
            <div className={styles.emptyFlight} key={index}></div>
          ))}
        </div>
      </section>
    );
  }

  if (!flights.length) {
    return <div hidden></div>;
  }

  return (
    <section className={styles.flightBlock}>
      <h2 className={styles.h2}>
        <span className={styles.h2orange}>Special</span> offers
      </h2>
      <div className={styles.flightSection}>
        {flights.map((flight, index) => (
          <FlightBlock key={index} flight={flight} origin={flight.originCity} />
        ))}
      </div>
    </section>
  );
}
