import { notFound } from "next/navigation";
import TopFlights from "./TopFlights";
import styles from "./page.module.css";

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

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const citySlug = decodeURIComponent(city);

  const res = await fetch(
    `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
      citySlug,
    )}&types[]=city&locale=en`,
    {
      next: { revalidate: 86400 }, // 24 часа
    },
  );

  if (!res.ok) notFound();

  const places: Place[] = await res.json();

  const matchedCity = places.find((p) => slugify(p.name) === citySlug);

  if (!matchedCity) notFound();

  return (
    <main className={styles.mainBlock}>
      <h1>
        Cheapest flights <br />
        from {matchedCity.name}
      </h1>

      <p>Country: {matchedCity.country_name}</p>

      {/* ✈ Передаём IATA code */}
      <TopFlights origin={matchedCity.code} />
    </main>
  );
}
