import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { cities } from "../../../../lib/cities";
import FlightsTabs from "../../../../components/FlightsTabs/FlightsTabs";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

type TripType = "oneWay" | "roundTrip";
type Duration = "short" | "week" | "weekend";

type SearchFilters = {
  trip: TripType;
  month: string | null;
  monthLabel: string | null;
  duration: Duration | null;
  hasFilters: boolean;
};

function getFirstValue(value: string | string[] | undefined): string | null {
  return typeof value === "string"
    ? value
    : Array.isArray(value)
      ? (value[0] ?? null)
      : null;
}

function isMonth(value: string | null): value is string {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

function getMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function getSearchFilters(
  searchParams: Record<string, string | string[] | undefined>,
): SearchFilters {
  const requestedTrip = getFirstValue(searchParams.trip);
  const requestedMonth = getFirstValue(searchParams.month);
  const requestedDuration = getFirstValue(searchParams.duration);
  const trip: TripType = requestedTrip === "roundTrip" ? "roundTrip" : "oneWay";
  const month = isMonth(requestedMonth) ? requestedMonth : null;
  const duration: Duration | null =
    trip === "roundTrip" &&
    (requestedDuration === "short" ||
      requestedDuration === "week" ||
      requestedDuration === "weekend")
      ? requestedDuration
      : null;
  return {
    trip,
    month,
    monthLabel: month ? getMonthLabel(month) : null,
    duration,
    hasFilters: Boolean(requestedTrip || month || duration),
  };
}

function getDurationLabel(duration: Duration | null): string | null {
  if (duration === "short") return "2–3 days";
  if (duration === "week") return "4–7 days";
  if (duration === "weekend") return "Weekend";
  return null;
}

function getSearchTitle(city: string, filters: SearchFilters): string {
  const tripLabel =
    filters.trip === "roundTrip"
      ? "Round-trip flight deals"
      : "One-way flight deals";
  const monthPart = filters.monthLabel ? ` in ${filters.monthLabel}` : "";
  const durationLabel = getDurationLabel(filters.duration);
  const durationPart = durationLabel
    ? durationLabel === "Weekend"
      ? " — weekend breaks"
      : ` — ${durationLabel.toLowerCase()} trips`
    : "";

  // return `${tripLabel} from ${city}${monthPart}${durationPart}`;
  return `${tripLabel} from ${city}`;
}

function getDurationDescription(duration: Duration | null): string | null {
  if (duration === "short") return "a 2–3 day trip";
  if (duration === "week") return "a 4–7 day trip";
  if (duration === "weekend") return "a weekend break";
  return null;
}

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
  searchParams,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const filters = getSearchFilters(await searchParams);
  const resolvedCity = await resolveCity(city);

  if (!resolvedCity) {
    return {
      title: "Cheap flights by departure city",
      description:
        "Compare cheap flights, low fares, and destination ideas by departure city.",
    };
  }

  const searchTitle = getSearchTitle(resolvedCity.name, filters);
  const title = filters.hasFilters
    ? `${searchTitle} | toTheTrip`
    : `Cheap flights from ${resolvedCity.name}`;
  const description = filters.hasFilters
    ? `Browse recently found direct fares from ${resolvedCity.name}${filters.monthLabel ? ` for ${filters.monthLabel}` : ""}. Prices and availability can change before booking.`
    : `Compare cheap flights from ${resolvedCity.name}, including low fares, one-way and round-trip options, airline choices, and destination ideas from ${resolvedCity.name}.`;
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
    robots: filters.hasFilters ? { index: false, follow: true } : undefined,
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

export default async function CityPage({ params, searchParams }: PageProps) {
  const { city } = await params;
  const filters = getSearchFilters(await searchParams);
  const matchedCity = await resolveCity(city);

  if (!matchedCity) notFound();

  const searchTitle = getSearchTitle(matchedCity.name, filters);
  const tripLabel = filters.trip === "roundTrip" ? "Round trip" : "One way";
  const durationLabel = getDurationLabel(filters.duration);
  const canonical = `/flights/from/${matchedCity.slug}`;
  const searchSummary = [tripLabel, filters.monthLabel, durationLabel].filter(
    Boolean,
  ) as string[];
  const durationDescription = getDurationDescription(filters.duration);
  const resultDescription = `Fare prices are based on rates found within the last 7 days and are subject to change prior to booking.`;

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
        item: `https://toTheTrip.app${canonical}`,
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: searchTitle,
    description: resultDescription,
    mainEntity: {
      "@type": "ItemList",
      name: searchTitle,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How can I find ${searchTitle.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${resultDescription} Change the filters on the home page to explore a different month, trip type, or trip length.`,
        },
      },
      {
        "@type": "Question",
        name: `What is included in this ${searchTitle.toLowerCase()} search?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `This search shows direct flight deals from ${matchedCity.name} that match the selected travel filters and are available in the latest fare data.`,
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
            ...(filters.hasFilters ? [] : [faqSchema]),
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
              <span>Flight search</span>
              <span aria-hidden="true">/</span>
              <span>From {matchedCity.name}</span>
              {/* <span className={styles.crumbLabel}>Search results</span> */}
            </nav>
            <h1 className={styles.title}>
              {
                <>
                  Cheap flights from{" "}
                  <span className={styles.h1blue}>{matchedCity.name}</span>
                </>
              }
            </h1>
            {filters.hasFilters ? (
              <ul className={styles.filterSummary} aria-label="Applied filters">
                {searchSummary.map((filter) => (
                  <li key={filter}>{filter}</li>
                ))}
              </ul>
            ) : null}
            <div className={styles.sectionHeader}>
              <p className={styles.sectionText}>
                {filters.hasFilters
                  ? resultDescription
                  : `Compare cheap flights from ${matchedCity.name}, including one-way and round-trip fares, low-cost airline options, weekend trips, and destination ideas. This page helps you find the best flight deals from ${matchedCity.name} with current route options in one place.`}
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
      {/* <section className={styles.copySection} aria-labelledby="city-copy-title">
        <div className={styles.maxWidth960}>
          <div className={styles.copyGrid}>
            <section className={styles.copyBlock}>
              <h2 id="city-copy-title" className={styles.copyTitle}>
                {filters.hasFilters
                  ? "About these results"
                  : `Find cheap flights from ${matchedCity.name} with flexible travel options`}
              </h2>
              <p className={styles.copyText}>
                {filters.hasFilters
                  ? resultDescription
                  : `Compare cheap flights from ${matchedCity.name} across one-way, round-trip, and weekend trip searches. This city page is built to help users discover low fares, airline options, and popular destination ideas from ${matchedCity.name} faster.`}
              </p>
              <p className={styles.copyText}>
                {filters.hasFilters
                  ? "A displayed fare is an indication, not a reservation. Before booking, confirm availability, baggage rules, fare conditions, and the final price with the booking provider."
                  : `If you are searching for the best flight deals from ${matchedCity.name}, review current routes, compare flexible travel dates, and check destination pages with additional route details before booking.`}
              </p>
            </section>
            <section className={styles.copyBlock}>
              <h2 className={styles.copyTitle}>
                {filters.hasFilters
                  ? "Refine your trip"
                  : `Popular flight searches from ${matchedCity.name}`}
              </h2>
              <p className={styles.copyText}>
                {filters.hasFilters
                  ? "Change the travel month, trip type, or length on the home page to see a different set of currently found fares from this city."
                  : `Travelers often look for cheap flights from ${matchedCity.name} to major European cities, short city-break routes, direct flights, budget airline deals, and low-cost round-trip fares. This page supports those long-tail searches with updated route lists and clear flight categories.`}
              </p>
              <p className={styles.copyText}>
                {filters.hasFilters
                  ? "Open a destination page to review route-specific information and available outbound booking options."
                  : `Use the tabs above to compare one-way tickets from ${matchedCity.name}, round-trip fares, and weekend getaway ideas, then open any destination page to see route-specific flight details and outbound booking options.`}
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
      </section> */}
    </main>
  );
}
