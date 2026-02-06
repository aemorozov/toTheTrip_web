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

  const safeSetCity = (value?: string | null) => {
    if (lockedByUser.current) return;
    if (!value || !value.trim()) return;
    setCity(value);
  };

  const resolveCityViaPlaces = async (term: string) => {
    console.log("ntrcn");
    try {
      const res = await fetch(`/api/places?term=${encodeURIComponent(term)}`);
      const data: Place[] = await res.json();

      if (!data.length) return;

      const best = data[0];

      // airport → берём city_name
      if (best.type === "airport" && best.city_name) {
        safeSetCity(best.city_name);
        return;
      }

      // city → name
      safeSetCity(best.name);
    } catch {
      // тихо фейлим
    }
  };

  useEffect(() => {
    // 1️⃣ URL
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("origin") || params.get("from");
    if (fromUrl) {
      resolveCityViaPlaces(fromUrl);
    }

    // 2️⃣ localStorage
    const cached = localStorage.getItem("departure_city");
    if (cached) {
      safeSetCity(cached);
      return; // если есть — дальше не нужно
    }

    // 3️⃣ IP fallback
    fetch("/api/ip-geo")
      .then((res) => res.json())
      .then((data) => {
        if (data.city) {
          resolveCityViaPlaces(data.city);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <input
      type="text"
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
