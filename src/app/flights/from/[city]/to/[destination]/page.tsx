import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RouteDetailsClient from "./RouteDetailsClient";
import styles from "./page.module.css";
import { cities, type DestinationCity } from "../../../../../../lib/cities";

export const dynamic = "force-static";
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ city: string; destination: string }>;
};

type LocalCity = (typeof cities)[keyof typeof cities];

type LocalPlaceHint = {
  code: string;
  name: string;
  slug: string;
};

type Place = {
  type?: "city" | "airport";
  name: string;
  code?: string;
  city_name?: string;
  coordinates?: {
    lat?: number | string | null;
    lon?: number | string | null;
  };
  country_name?: string;
  country_code?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lon?: number | string | null;
};

type ResolvedPlace = {
  code: string;
  countryName?: string;
  countryCode?: string;
  latitude?: number | null;
  longitude?: number | null;
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

function parseCoordinate(value?: number | string | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function findLocalCity(value: string): ({ slug: string } & LocalCity) | null {
  const normalized = value.toLowerCase();

  if (cities[normalized as keyof typeof cities]) {
    return {
      slug: normalized,
      ...cities[normalized as keyof typeof cities],
    };
  }

  const byName = Object.entries(cities).find(
    ([, city]) => slugify(city.name) === normalized,
  );
  if (byName) {
    return { slug: byName[0], ...byName[1] };
  }

  const byCode = Object.entries(cities).find(
    ([, city]) => city.code.toLowerCase() === normalized,
  );
  if (byCode) {
    return { slug: byCode[0], ...byCode[1] };
  }

  return null;
}

function findDestinationForOrigin(
  originSlug: string,
  destinationValue: string,
): LocalPlaceHint | null {
  const origin = cities[originSlug as keyof typeof cities];

  if (!origin) return null;

  const normalized = destinationValue.toLowerCase();
  const match = origin.destinations.find(
    (destination) =>
      destination.slug === normalized ||
      destination.code.toLowerCase() === normalized ||
      slugify(destination.name) === normalized,
  );

  if (!match) return null;

  return {
    code: match.code,
    name: match.name,
    slug: match.slug,
  };
}

async function fetchPlace(term: string): Promise<Place[]> {
  const res = await fetch(
    `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
      term,
    )}&types[]=city&types[]=airport&locale=en`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) return [];

  const data: Place[] = await res.json();
  return Array.isArray(data) ? data : [];
}

async function resolvePlace(
  value: string,
  localHint?: LocalPlaceHint | null,
): Promise<ResolvedPlace | null> {
  const local = localHint || findLocalCity(value);
  const terms = [value, local?.code, local?.name].filter(Boolean) as string[];

  for (const term of terms) {
    const results = await fetchPlace(term);
    const exact = results.find((item) => {
      const itemName = item.city_name || item.name;
      return (
        slugify(itemName || "") === slugify(local?.name || value) ||
        item.code?.toLowerCase() === (local?.code || value).toLowerCase()
      );
    });
    const picked =
      exact || results.find((item) => item.type === "city") || results[0];

    if (picked?.name && (picked.code || local?.code)) {
      const name = local?.name || picked.city_name || picked.name || value;
      return {
        code: picked.code || local?.code || "",
        countryCode: picked.country_code,
        countryName: picked.country_name,
        latitude:
          parseCoordinate(picked.coordinates?.lat) ??
          parseCoordinate(picked.latitude) ??
          parseCoordinate(picked.lat) ??
          null,
        longitude:
          parseCoordinate(picked.coordinates?.lon) ??
          parseCoordinate(picked.longitude) ??
          parseCoordinate(picked.lon) ??
          null,
        name,
        slug: slugify(name),
      };
    }
  }

  if (local) {
    return {
      code: local.code,
      name: local.name,
      slug: local.slug,
    };
  }

  return null;
}

function haversineKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null,
): number | null {
  if (
    [lat1, lon1, lat2, lon2].some(
      (value) => value === null || value === undefined,
    )
  ) {
    return null;
  }

  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad((lat2 as number) - (lat1 as number));
  const dLon = toRad((lon2 as number) - (lon1 as number));
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1 as number)) *
      Math.cos(toRad(lat2 as number)) *
      Math.sin(dLon / 2) ** 2;

  return Math.round(
    earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  );
}

function estimateFlightTime(distanceKm: number | null): string | null {
  if (!distanceKm) return null;
  const totalMinutes = Math.max(60, Math.round((distanceKm / 820) * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

async function getRouteBaseData(city: string, destination: string) {
  const decodedCity = decodeURIComponent(city);
  const decodedDestination = decodeURIComponent(destination);
  const originHint = findLocalCity(decodedCity);
  const destinationHint = findDestinationForOrigin(
    originHint?.slug || decodedCity,
    decodedDestination,
  );
  const origin = await resolvePlace(decodedCity, originHint);
  const dest = await resolvePlace(decodedDestination, destinationHint);

  if (!origin || !dest || !origin.code || !dest.code) {
    return null;
  }

  const distanceKm = haversineKm(
    origin.latitude,
    origin.longitude,
    dest.latitude,
    dest.longitude,
  );

  return {
    destination: dest,
    distanceKm,
    estimatedFlightTime: estimateFlightTime(distanceKm),
    origin,
  };
}

export async function generateStaticParams() {
  return Object.entries(cities).flatMap(([slug, cityInfo]) =>
    cityInfo.destinations.map((destination: DestinationCity) => ({
      city: slug,
      destination: destination.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const route = await getRouteBaseData(
    resolvedParams.city,
    resolvedParams.destination,
  );

  if (!route) {
    return {
      title: "Flight route details",
      description: "Check route details, fares, and flight information.",
    };
  }

  const title = `Cheap flights from ${route.origin.name} to ${route.destination.name}`;
  const description = `Compare cheap flights from ${route.origin.name} to ${route.destination.name}, including route distance, low fares, airport codes, and live flight search details.`;
  const canonical = `/flights/from/${route.origin.slug}/to/${route.destination.slug}`;

  return {
    title,
    description,
    keywords: [
      `cheap flights from ${route.origin.name} to ${route.destination.name}`,
      `${route.origin.name} to ${route.destination.name} flight deals`,
      `${route.origin.name} to ${route.destination.name} low fares`,
      `${route.origin.name} to ${route.destination.name} route details`,
      `${route.origin.name} to ${route.destination.name} round trip`,
      `${route.origin.name} to ${route.destination.name} one way`,
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

export default async function FlightDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const route = await getRouteBaseData(
    resolvedParams.city,
    resolvedParams.destination,
  );

  if (!route) {
    notFound();
  }

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
        name: `Flights from ${route.origin.name}`,
        item: `https://toTheTrip.app/flights/from/${route.origin.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${route.origin.name} to ${route.destination.name}`,
        item: `https://toTheTrip.app/flights/from/${route.origin.slug}/to/${route.destination.slug}`,
      },
    ],
  };

  const routeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Cheap flights from ${route.origin.name} to ${route.destination.name}`,
    description: `Route details, distance, fares, and travel information for flights from ${route.origin.name} to ${route.destination.name}.`,
    mainEntity: {
      "@type": "Trip",
      name: `${route.origin.name} to ${route.destination.name}`,
      provider: {
        "@type": "Organization",
        name: "toTheTrip.app",
      },
      itinerary: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "Airport",
            name: route.origin.name,
            iataCode: route.origin.code,
          },
          {
            "@type": "Airport",
            name: route.destination.name,
            iataCode: route.destination.code,
          },
        ],
      },
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How can I find cheap flights from ${route.origin.name} to ${route.destination.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Compare live travel-site offers, flexible dates, and airline options for flights from ${route.origin.name} to ${route.destination.name} to spot lower fares.`,
        },
      },
      {
        "@type": "Question",
        name: `Does this page show one-way and round-trip options from ${route.origin.name} to ${route.destination.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. This route page can surface one-way or round-trip details when those flight dates and pricing details are available.`,
        },
      },
    ],
  };

  return (
    <main className={styles.mainBlock}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, routeSchema, faqSchema]),
        }}
      />

      <div className={styles.heroBlock}>
        <div className={styles.heroBackground} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.maxWidth960}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/flights/from/${route.origin.slug}`}>
                Flights from {route.origin.name}
              </Link>
              <span aria-hidden="true">/</span>
              <span>To {route.destination.name}</span>
              <span className={styles.crumbLabel}>Route details</span>
            </nav>
            <h1 className={styles.title}>
              Cheap flights from{" "}
              <span className={styles.h1blue}>{route.origin.name}</span> to{" "}
              <span className={styles.h1blue}>{route.destination.name}</span>
            </h1>
            <div className={styles.sectionHeader}>
              <h2 id="route-overview" className={styles.sectionTitle}>
                Low fares, distance, and flight details for {route.origin.name} to{" "}
                {route.destination.name}
              </h2>
              <p className={styles.sectionText}>
                Compare cheap flights from {route.origin.name} to{" "}
                {route.destination.name}, including route distance, travel dates,
                direct or connecting options, low fares, and airline details.
                This route page helps you find the best flight deals from{" "}
                {route.origin.name} to {route.destination.name} with useful route
                facts in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.contentSection} aria-labelledby="route-overview">
        <div className={styles.maxWidth960}>
          <RouteDetailsClient
            destinationCode={route.destination.code}
            destinationCountryName={route.destination.countryName}
            destinationName={route.destination.name}
            distanceKm={route.distanceKm}
            estimatedFlightTime={route.estimatedFlightTime}
            originCode={route.origin.code}
            originCountryName={route.origin.countryName}
            originName={route.origin.name}
          />
        </div>
      </section>
    </main>
  );
}
