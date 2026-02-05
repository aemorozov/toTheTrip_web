"use client";
import styles from "./CityInput.module.css";
import { useEffect, useState } from "react";

export default function CityInput() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectByIp = async () => {
      try {
        const res = await fetch("/api/ip-geo");
        const data = await res.json();
        if (data.city) setCity(data.city);
      } catch (e) {
        console.error("IP geo error", e);
      } finally {
        setLoading(false);
      }
    };

    if (!("geolocation" in navigator)) {
      detectByIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `/api/reverse-geocode?lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const data = await res.json();

          const detectedCity =
            data.address?.city || data.address?.town || data.address?.village;

          if (detectedCity) {
            setCity(detectedCity);
          } else {
            detectByIp();
          }
        } catch (e) {
          detectByIp();
        } finally {
          setLoading(false);
        }
      },
      () => {
        detectByIp();
      },
      {
        timeout: 5000,
      },
    );
  }, []);

  return (
    <input
      type="text"
      id="city"
      value={city}
      onChange={(e) => setCity(e.target.value)}
      className={styles.heroInput}
      placeholder={loading ? "Your city is …" : "Paris"}
    />
  );
}
