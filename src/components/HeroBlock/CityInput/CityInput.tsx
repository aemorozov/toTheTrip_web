"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CityInput.module.css";

type Place = {
  type: "city" | "airport";
  name: string;
  city_name?: string;
};

type Props = {
  onChange?: (value: string) => void;
};

export default function CityInput({ onChange }: Props) {
  const [city, setCity] = useState<string>("");
  const lockedByUser = useRef<boolean>(false);

  const safeSetCity = (value?: string) => {
    if (lockedByUser.current) return;
    if (!value?.trim()) return;

    setCity(value);
    onChange?.(value);
  };

  const resolveViaPlaces = async (term: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/places?term=${encodeURIComponent(term)}`);
      const data: Place[] = await res.json();

      if (!Array.isArray(data) || data.length === 0) return false;

      const airport = data.find((p) => p.type === "airport" && p.city_name);
      if (airport?.city_name) {
        safeSetCity(airport.city_name);
        return true;
      }

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
    const cached = localStorage.getItem("departure_city");
    if (cached) {
      setCity(cached);
      onChange?.(cached);
      return;
    }

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then(async (data) => {
        if (data?.city) {
          const ok = await resolveViaPlaces(data.city);
          if (ok) return;
        }

        if (data?.country_name) {
          await resolveViaPlaces(data.country_name);
        }
      })
      .catch(() => {});
  }, [onChange]);

  return (
    <input
      id="cityInput"
      className={styles.heroInput}
      value={city}
      placeholder="City of departure"
      onChange={(e) => {
        lockedByUser.current = true;
        const value = e.target.value;
        setCity(value);
        onChange?.(value);
        localStorage.setItem("departure_city", value);
      }}
    />
  );
}
