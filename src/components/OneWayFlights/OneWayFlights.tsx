"use client";

import { useEffect, useState } from "react";
import styles from "./OneWayFlights.module.css";

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
};

export default function OneWayFlights({ origin }: Props) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/oneWayFlights?origin=${origin}`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setFlights(data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [origin]);

  if (loading) {
    return (
      <section className={styles.flightSection}>
        <h2 className={styles.h2}>One way cheapest flights</h2>
        <p>Loading data...</p>
      </section>
    );
  }
  if (!flights.length) return <p>No cheap flights found.</p>;

  return (
    <section className={styles.flightSection}>
      <h2 className={styles.h2}>Round trip cheapest flights</h2>
      {flights.map((flight, index) => (
        <div className={styles.flight} key={index}>
          <div className={styles.flightsInfo}>
            <div className={styles.cities}>
              <strong>
                {flight.originCity || origin} →{" "}
                {flight.destinationCity || flight.destination}
              </strong>
            </div>
            <div>
              Departure: {new Date(flight.departure_at).toLocaleDateString()}
            </div>
          </div>
          <div className={styles.flightPrice}>
            <div>
              {flight.price}
              <small>€</small>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
