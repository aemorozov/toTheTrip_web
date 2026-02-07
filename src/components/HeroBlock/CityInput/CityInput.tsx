"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CityInput.module.css";

type Place = {
  type: "city" | "airport";
  name: string;
  city_name?: string;
};

export default function CityInput() {
  const [city, setCity] = useState<string>(""); // всегда string
  const lockedByUser = useRef(false);

  const safeSetCity = (value?: string) => {
    if (lockedByUser.current) return;
    if (!value || !value.trim()) return;
    setCity(value);
  };

  const resolveViaPlaces = async (term: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/places?term=${encodeURIComponent(term)}`);
      const data: Place[] = await res.json();

      if (!Array.isArray(data) || !data.length) return false;

      // 1️⃣ airport → city_name
      const airport = data.find((p) => p.type === "airport" && p.city_name);
      if (airport?.city_name) {
        safeSetCity(airport.city_name);
        return true;
      }

      // 2️⃣ city → name
      const city = data.find((p) => p.type === "city");
      if (city?.name) {
        safeSetCity(city.name);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // 1️⃣ localStorage
    const cached = localStorage.getItem("departure_city");
    if (cached) {
      setCity(cached);
      return;
    }

    // 2️⃣ IP → city → places2
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then(async (data) => {
        if (data?.city) {
          const ok = await resolveViaPlaces(data.city);
          if (ok) return;
        }

        // 3️⃣ IP → country → places2
        if (data?.country_name) {
          const ok = await resolveViaPlaces(data.country_name);
          if (ok) return;
        }
      })
      .catch(() => {});
  }, []);

  return (
    <input
      className={styles.heroInput}
      value={city}
      placeholder="City of departure"
      onChange={(e) => {
        lockedByUser.current = true;
        const value = e.target.value;
        setCity(value);
        localStorage.setItem("departure_city", value);
      }}
    />
  );
}
