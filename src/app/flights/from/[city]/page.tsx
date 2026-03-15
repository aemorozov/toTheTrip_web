import { notFound } from "next/navigation";
import FlightsMainBlock from "../../../../components/FlightsMainBlock/FlightsMainBlock";
import styles from "./page.module.css";
import { cities } from "../../../../lib/cities";
import Link from "next/link";

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
      openGraph: {
        title: cityData.title,
        description: cityData.description,
      },
      twitter: {
        card: "summary_large_image",
        title: cityData.title,
        description: cityData.description,
      },
    };
  }

  // если нет — делаем универсальный fallback
  const fallbackTitle = `Cheap flights from ${citySlug}`;
  const fallbackDescription = `Find and compare cheap flights from ${ucFirst(
    citySlug,
  )}. Book airline tickets at the best prices.`;

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: fallbackTitle,
      description: fallbackDescription,
    },
  };
}

/* =========================
   ✅ 4. Основная страница
========================= */

export default async function CityPage({ params }: PageProps) {
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
        <div className={styles.heroBackground} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.maxWidth960}>
            <p className={styles.eyebrow}>The best deals</p>
            <h1 className={styles.title}>
              Cheap flights from {matchedCity.name}
            </h1>
            <p className={styles.subtitle}>
              Find the best cheap flight deals from {matchedCity.name} for
              round-trip, one-way, and weekend flights.
            </p>
            <div className={styles.heroMeta}>
              <Link href="#roundTrip">
                <span>Round trips</span>
              </Link>
              <Link href="#oneWay">
                <span>One way tickets</span>
              </Link>
              <Link href="#weekendTrips">
                <span>Weekend trips</span>
              </Link>
            </div>
            <div className={styles.sectionHeader}>
              <h2 id="flights-from-city" className={styles.sectionTitle}>
                Find deals on flights from {matchedCity.name}
              </h2>
              <p className={styles.sectionText}>
                Explore round trips, one-way tickets, and weekend getaways from{" "}
                {matchedCity.name}. Prices update regularly, so you can spot
                good fares and plan faster.
              </p>
            </div>
          </div>
        </div>
      </div>
      <section
        className={styles.flightsGroup}
        aria-labelledby="flights-from-city"
      >
        <FlightsMainBlock origin={matchedCity.code} parameters={"roundTrip"} />
        <FlightsMainBlock origin={matchedCity.code} parameters={"oneWay"} />
        <FlightsMainBlock
          origin={matchedCity.code}
          parameters={"weekendTrips"}
        />
      </section>
    </main>
  );
}
