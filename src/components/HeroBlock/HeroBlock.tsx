"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./HeroBlock.module.css";

type Place = {
  type: "city" | "airport";
  name: string;
  city_name?: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function HeroBlock() {
  const router = useRouter();

  const [city, setCity] = useState<string>("");
  const lockedByUser = useRef<boolean>(false);

  const resolveCityAndRedirect = async () => {
    if (!city.trim()) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);

    try {
      const res = await fetch(
        `/api/places?term=${encodeURIComponent(city)}&locale=en`,
        { signal: controller.signal },
      );

      clearTimeout(timeout);

      if (!res.ok) throw new Error();

      const data: Place[] = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        router.push("/404");
        return;
      }

      const foundCity =
        data.find((p) => p.type === "city") ||
        data.find((p) => p.type === "airport" && p.city_name);

      const finalName =
        foundCity?.type === "airport" ? foundCity.city_name : foundCity?.name;

      if (!finalName) {
        router.push("/404");
        return;
      }

      const slug = slugify(finalName);
      router.push(`/flights/from/${slug}`);
    } catch {
      router.push("/404");
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("departure_city");
    if (cached) setCity(cached);
  }, []);

  return (
    <section className={styles.heroBlock}>
      <div className={styles.heroForm}>
        <label htmlFor="city" className={styles.heroLabel}>
          I want cheap flights from
        </label>

        <input
          id="cityInput"
          className={styles.heroInput}
          value={city}
          placeholder="City of departure"
          onChange={(e) => {
            lockedByUser.current = true;
            const value = e.target.value;
            setCity(value);
            localStorage.setItem("departure_city", value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              resolveCityAndRedirect();
            }
          }}
        />

        <button
          className={styles.searchButton}
          onClick={resolveCityAndRedirect}
        >
          Click
        </button>
      </div>

      <div className={styles.leftBlock}>
        <h1>The cheapest flights from your city</h1>
      </div>
    </section>
  );
}
