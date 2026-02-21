import { notFound } from "next/navigation";
import RoundTripFlights from "../../../../components/RoundTripFlights/RoundTripFlights";
import styles from "./page.module.css";
import { cities } from "../../../../lib/cities";
import OneWayFlights from "../../../../components/OneWayFlights/OneWayFlights";

export const dynamic = "force-static";

type PageProps = {
  params: Promise<{ city: string }>;
};

type Place = {
  type: "city";
  name: string;
  code: string;
  country_name?: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/* =========================
   ✅ 1. SSG для городов из массива
========================= */

export async function generateStaticParams() {
  return Object.keys(cities).map((city) => ({
    city,
  }));
}

/* =========================
   ✅ 2. Разрешаем динамические slug
========================= */

export const dynamicParams = true;

/* =========================
   ✅ 3. Metadata для SEO
========================= */

export async function generateMetadata({ params }: PageProps) {
  const { city } = await params;
  const citySlug = decodeURIComponent(city);

  const cityData = cities[citySlug as keyof typeof cities];

  function ucFirst(str) {
    if (!str) return str; // если строка пустая, возвращаем её же
    return str[0].toUpperCase() + str.slice(1);
  }

  // если есть в локальном массиве → используем SEO из него
  if (cityData) {
    return {
      title: cityData.title,
      description: cityData.description,
    };
  }

  // если нет — делаем универсальный fallback
  return {
    title: `Cheap flights from ${citySlug}`,
    description: `Find and compare cheap flights from ${ucFirst(citySlug)}. Book airline tickets at the best prices.`,
  };
}

/* =========================
   ✅ 4. Основная страница
========================= */

export default async function CityPage({ params }: PageProps) {
  const pageGeneratedAt = new Date();
  let matchedCity: { name: string; code: string };
  const { city } = await params;
  const citySlug = decodeURIComponent(city);

  const cityData = cities[citySlug as keyof typeof cities];

  if (cityData) {
    matchedCity = {
      name: cityData.name,
      code: cityData.code,
    };
  } else {
    const res = await fetch(
      `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
        citySlug,
      )}&types[]=city&locale=en`,
      {
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) notFound();

    const places: Place[] = await res.json();

    const found = places.find((p) => slugify(p.name) === citySlug);

    if (!found) notFound();

    matchedCity = {
      name: found.name,
      code: found.code,
    };
  }

  return (
    <main className={styles.mainBlock}>
      <div className={styles.heroBlock}>
        <div className={styles.maxWidth960}>
          <h1 className={styles.title}>
            The cheapest flights <br />
            from {matchedCity.name}
          </h1>
        </div>
      </div>
      <div className={styles.maxWidth960}>
        <RoundTripFlights origin={matchedCity.code} />
        <OneWayFlights origin={matchedCity.code} />
        <div style={{ width: "100%", padding: 20, fontSize: 12, opacity: 0.6 }}>
          Page generated at: {pageGeneratedAt.toUTCString()}
        </div>
      </div>
    </main>
  );
}
