import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { cities } from "../../../../lib/cities";
import FlightsTabs from "../../../../components/FlightsTabs/FlightsTabs";

export const dynamic = "force-static";
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ city: string }>;
};

type Place = {
  type: "city";
  name: string;
  code: string;
  country_name?: string;
};

type ResolvedCity = {
  code: string;
  countryName?: string;
  name: string;
  slug: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function resolveCity(city: string): Promise<ResolvedCity | null> {
  const citySlug = decodeURIComponent(city);
  const cityData = cities[citySlug as keyof typeof cities];

  if (cityData) {
    return {
      code: cityData.code,
      name: cityData.name,
      slug: citySlug,
    };
  }

  const res = await fetch(
    `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
      citySlug,
    )}&types[]=city&locale=en`,
    {
      next: { revalidate: 86400 },
    },
  );

  if (!res.ok) return null;

  const places: Place[] = await res.json();
  const found = places.find((place) => slugify(place.name) === citySlug);

  if (!found) return null;

  return {
    code: found.code,
    countryName: found.country_name,
    name: found.name,
    slug: citySlug,
  };
}

export async function generateStaticParams() {
  return Object.keys(cities).map((city) => ({
    city,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const resolvedCity = await resolveCity(city);

  if (!resolvedCity) {
    return {
      title: "Cheap flights by departure city",
      description:
        "Compare cheap flights, low fares, and destination ideas by departure city.",
    };
  }

  const title = `Cheap flights from ${resolvedCity.name}`;
  const description = `Compare cheap flights from ${resolvedCity.name}, including low fares, one-way and round-trip options, airline choices, and destination ideas from ${resolvedCity.name}.`;
  const canonical = `/flights/from/${resolvedCity.slug}`;

  return {
    title,
    description,
    keywords: [
      `cheap flights from ${resolvedCity.name}`,
      `${resolvedCity.name} flight deals`,
      `${resolvedCity.name} one way flights`,
      `${resolvedCity.name} round trip flights`,
      `${resolvedCity.name} weekend trips`,
      `${resolvedCity.name} low fares`,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const matchedCity = await resolveCity(city);

  if (!matchedCity) notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://toTheTrip.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Flights from ${matchedCity.name}`,
        item: `https://toTheTrip.app/flights/from/${matchedCity.slug}`,
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Cheap flights from ${matchedCity.name}`,
    description: `Find cheap flights from ${matchedCity.name}, compare low fares, and browse destination routes from ${matchedCity.name}.`,
    mainEntity: {
      "@type": "ItemList",
      name: `Flight deals from ${matchedCity.name}`,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How can I find cheap flights from ${matchedCity.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Browse one-way, round-trip, and weekend flight options from ${matchedCity.name}, then compare destination ideas and current prices in one place.`,
        },
      },
      {
        "@type": "Question",
        name: `What kind of routes are shown from ${matchedCity.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `This page highlights low-fare routes from ${matchedCity.name}, including popular city-break destinations, round trips, and budget-friendly one-way flights.`,
        },
      },
    ],
  };

  const localCity = cities[matchedCity.slug as keyof typeof cities];
  const routeLinks = localCity?.destinations ?? [];

  return (
    <main className={styles.mainBlock}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema,
            collectionSchema,
            faqSchema,
          ]),
        }}
      />

      <div className={styles.heroBlock}>
        <div className={styles.heroBackground} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.maxWidth960}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Flights from {matchedCity.name}</span>
              <span className={styles.crumbLabel}>Best deals</span>
            </nav>
            <h1 className={styles.title}>
              Cheap flights from{" "}
              <span className={styles.h1blue}>{matchedCity.name}</span>
            </h1>
            <div className={styles.sectionHeader}>
              <h2 id="flights-from-city" className={styles.sectionTitle}>
                Low fares, airlines, and destination ideas from {matchedCity.name}
              </h2>
              <p className={styles.sectionText}>
                Compare cheap flights from {matchedCity.name}, including one-way
                and round-trip fares, low-cost airline options, weekend trips, and
                destination ideas. This page helps you find the best flight deals
                from {matchedCity.name} with current route options in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
      <section
        className={styles.flightsGroup}
        aria-labelledby="flights-from-city"
      >
        <FlightsTabs origin={matchedCity.code} />
      </section>
      <section className={styles.copySection} aria-labelledby="city-copy-title">
        <div className={styles.maxWidth960}>
          <div className={styles.copyGrid}>
            <section className={styles.copyBlock}>
              <h2 id="city-copy-title" className={styles.copyTitle}>
                Find cheap flights from {matchedCity.name} with flexible travel
                options
              </h2>
              <p className={styles.copyText}>
                Compare cheap flights from {matchedCity.name} across one-way,
                round-trip, and weekend trip searches. This city page is built
                to help users discover low fares, airline options, and popular
                destination ideas from {matchedCity.name} faster.
              </p>
              <p className={styles.copyText}>
                If you are searching for the best flight deals from{" "}
                {matchedCity.name}, review current routes, compare flexible
                travel dates, and check destination pages with additional route
                details before booking.
              </p>
            </section>
            <section className={styles.copyBlock}>
              <h2 className={styles.copyTitle}>
                Popular flight searches from {matchedCity.name}
              </h2>
              <p className={styles.copyText}>
                Travelers often look for cheap flights from {matchedCity.name}
                to major European cities, short city-break routes, direct
                flights, budget airline deals, and low-cost round-trip fares.
                This page supports those long-tail searches with updated route
                lists and clear flight categories.
              </p>
              <p className={styles.copyText}>
                Use the tabs above to compare one-way tickets from{" "}
                {matchedCity.name}, round-trip fares, and weekend getaway ideas,
                then open any destination page to see route-specific flight
                details and outbound booking options.
              </p>
              {routeLinks.length ? (
                <div className={styles.linkCluster}>
                  {routeLinks.slice(0, 10).map((destination) => (
                    <Link
                      key={destination.slug}
                      href={`/flights/from/${matchedCity.slug}/to/${destination.slug}`}
                      className={styles.inlineLinkCard}
                    >
                      Flights from {matchedCity.name} to {destination.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
