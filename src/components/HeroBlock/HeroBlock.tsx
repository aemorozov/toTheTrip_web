"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cities } from "../../lib/cities";
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
  const [city, setCity] = useState("");
  const lockedByUser = useRef(false);

  const safeSetCity = (value?: string) => {
    if (!value?.trim()) return;
    if (lockedByUser.current) return;

    setCity(value);
    localStorage.setItem("departure_city", value);
  };

  // 🔎 Запрос в places2 для нормализации
  const resolveViaPlaces = async (term: string): Promise<string | null> => {
    try {
      const normalizedTerm = term.toLowerCase().trim();

      /* =========================
       ✅ 1. Проверяем локальный список городов
    ========================= */

      const localMatch = Object.entries(cities).find(
        ([slug, city]) =>
          slug === normalizedTerm || city.name.toLowerCase() === normalizedTerm,
      );

      if (localMatch) {
        return localMatch[1].name;
      }

      /* =========================
       ✅ 2. Если нет — идём в API
    ========================= */

      const controller = new AbortController();

      const res = await fetch(
        `/api/places?term=${encodeURIComponent(term)}&locale=en`,
        { signal: controller.signal },
      );

      if (!res.ok) return null;

      const data: Place[] = await res.json();

      if (!Array.isArray(data) || data.length === 0) return null;

      // приоритет — city
      const cityMatch = data.find((p) => p.type === "city");
      if (cityMatch?.name) return cityMatch.name;

      // fallback — airport
      const airportMatch = data.find(
        (p) => p.type === "airport" && p.city_name,
      );
      if (airportMatch?.city_name) return airportMatch.city_name;

      return null;
    } catch {
      return null;
    }
  };

  // 🚀 Поиск и редирект
  const handleSearch = async () => {
    if (!city.trim()) return;

    const normalized = await resolveViaPlaces(city);

    if (!normalized) {
      router.push("/404");
      return;
    }

    const slug = slugify(normalized);
    router.push(`/flights/from/${slug}`);
  };

  // 🌍 Автоопределение при загрузке
  useEffect(() => {
    const cached = localStorage.getItem("departure_city");

    if (cached) {
      setCity(cached);
      return;
    }

    const detectCity = async () => {
      try {
        const res = await fetch("/api/geo");
        const data = await res.json();

        if (data?.city) {
          const normalized = await resolveViaPlaces(data.city);
          if (normalized) {
            safeSetCity(normalized);
            return;
          }
        }

        // fallback по стране
        if (data?.country) {
          const normalized = await resolveViaPlaces(data.country);
          if (normalized) {
            safeSetCity(normalized);
          }
        }
      } catch {
        // можно добавить fallback город
      }
    };

    detectCity();
  }, []);

  return (
    <section className={styles.heroBlock}>
      <div className={styles.heroBackground} aria-hidden="true" />
      <div className={styles.insideHeroBlock}>
        <div className={styles.leftBlock}>
          <h1>Cheap flights from</h1>
        </div>
        <div className={styles.heroForm}>
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
                handleSearch();
              }
            }}
          />

          <button className={styles.searchButton} onClick={handleSearch}>
            One click
          </button>
          <p className={styles.heroDescription}>
            Service for finding the cheapest flights. Explore{" "}
            <strong>the cheapest flight deals</strong> instantly. We check all
            available flight APIs and know all the best prices based on the
            latest searches. All you have to do is see the best deals on flights
            from your city.
          </p>
        </div>
      </div>
    </section>
  );
}
