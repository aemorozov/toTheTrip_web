"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import styles from "./page.module.css";

type RouteDetailsClientProps = {
  destinationCode: string;
  destinationCountryName?: string;
  destinationName: string;
  distanceKm: number | null;
  estimatedFlightTime: string | null;
  originCode: string;
  originCountryName?: string;
  originName: string;
};

type Place = {
  code?: string;
  coordinates?: {
    lat?: number | string | null;
    lon?: number | string | null;
  };
  type?: "city" | "airport";
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lon?: number | string | null;
};

function formatShortDate(value?: string | null): string | null {
  if (!value) return null;
  const dt = DateTime.fromISO(value, { setZone: true });
  return dt.isValid ? dt.toFormat("dd LLL yyyy") : null;
}

function formatFullDateTime(value?: string | null): string | null {
  if (!value) return null;
  const dt = DateTime.fromISO(value, { setZone: true });
  return dt.isValid ? dt.toFormat("ccc, dd LLL yyyy 'at' HH:mm") : null;
}

function formatTripLength(
  departureAt?: string | null,
  returnAt?: string | null,
): string | null {
  if (!departureAt || !returnAt) return null;
  const from = DateTime.fromISO(departureAt, { setZone: true });
  const to = DateTime.fromISO(returnAt, { setZone: true });
  if (!from.isValid || !to.isValid) return null;

  const days = Math.max(1, Math.round(to.diff(from, "days").days));
  return `${days} day${days === 1 ? "" : "s"}`;
}

function formatTransferCount(value?: string | null): string | null {
  if (value === undefined || value === null || value === "") return null;
  const count = Number(value);
  if (!Number.isFinite(count)) return null;
  if (count === 0) return "Direct flight";
  if (count === 1) return "1 stop";
  return `${count} stops`;
}

function formatDistance(distanceKm: number | null): string | null {
  if (!distanceKm) return null;
  const miles = Math.round(distanceKm * 0.621371);
  return `${distanceKm.toLocaleString("en-US")} km / ${miles.toLocaleString("en-US")} mi`;
}

function parseCoordinate(value?: number | string | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
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

function pickPlaceWithCoordinates(
  places: Place[],
  code: string,
): { latitude: number | null; longitude: number | null } | null {
  const exact =
    places.find(
      (place) =>
        place.code?.toUpperCase() === code.toUpperCase() &&
        place.type === "airport",
    ) ||
    places.find((place) => place.code?.toUpperCase() === code.toUpperCase()) ||
    places.find((place) => place.type === "city") ||
    places[0];

  if (!exact) return null;

  return {
    latitude:
      parseCoordinate(exact.coordinates?.lat) ??
      parseCoordinate(exact.latitude) ??
      parseCoordinate(exact.lat),
    longitude:
      parseCoordinate(exact.coordinates?.lon) ??
      parseCoordinate(exact.longitude) ??
      parseCoordinate(exact.lon),
  };
}

function buildAviasalesUrl(
  originCode: string,
  destinationCode: string,
  departureAt?: string | null,
  returnAt?: string | null,
): string {
  const departure = departureAt
    ? DateTime.fromISO(departureAt, { setZone: true })
    : null;
  const returnDate = returnAt
    ? DateTime.fromISO(returnAt, { setZone: true })
    : null;

  if (departure?.isValid && returnDate?.isValid) {
    const searchPath = `${originCode}${departure.toFormat("ddMM")}${destinationCode}${returnDate.toFormat("ddMM")}1`;
    const baseUrl = `https://www.aviasales.com/search/${searchPath}?currency=EUR`;
    const encodedUrl = encodeURIComponent(baseUrl);
    return `https://tp.media/r?marker=59890&trs=443711&p=4114&u=${encodedUrl}&campaign_id=100`;
  }

  if (departure?.isValid) {
    const searchPath = `${originCode}${departure.toFormat("ddMM")}${destinationCode}1`;
    const baseUrl = `https://www.aviasales.com/search/${searchPath}?currency=EUR`;
    const encodedUrl = encodeURIComponent(baseUrl);
    return `https://tp.media/r?marker=59890&trs=443711&p=4114&u=${encodedUrl}&campaign_id=100`;
  }

  return `https://www.aviasales.com/search/${originCode}${destinationCode}?currency=EUR`;
}

function buildKiwiUrl(
  originName: string,
  originCountryName: string | undefined,
  destinationName: string,
  destinationCountryName: string | undefined,
  departureAt?: string | null,
  returnAt?: string | null,
): string {
  const slugifySegment = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const originSlug = [originName, originCountryName]
    .filter(Boolean)
    .map((value) => slugifySegment(value as string))
    .join("-");
  const destinationSlug = [destinationName, destinationCountryName]
    .filter(Boolean)
    .map((value) => slugifySegment(value as string))
    .join("-");

  const departure = departureAt
    ? DateTime.fromISO(departureAt, { setZone: true })
    : null;
  const returnDate = returnAt
    ? DateTime.fromISO(returnAt, { setZone: true })
    : null;

  if (!originSlug || !destinationSlug) {
    return "https://www.kiwi.com/en/";
  }

  if (departure?.isValid && returnDate?.isValid) {
    return `https://www.kiwi.com/en/search/results/${originSlug}/${destinationSlug}/${departure.toFormat(
      "yyyy-MM-dd",
    )}/${returnDate.toFormat("yyyy-MM-dd")}/`;
  }

  if (departure?.isValid) {
    return `https://www.kiwi.com/en/search/results/${originSlug}/${destinationSlug}/${departure.toFormat(
      "yyyy-MM-dd",
    )}/`;
  }

  return `https://www.kiwi.com/en/search/results/${originSlug}/${destinationSlug}/`;
}

function buildSkyscannerUrl(
  originCode: string,
  destinationCode: string,
  departureAt?: string | null,
  returnAt?: string | null,
): string {
  const departure = departureAt
    ? DateTime.fromISO(departureAt, { setZone: true })
    : null;
  const returnDate = returnAt
    ? DateTime.fromISO(returnAt, { setZone: true })
    : null;

  if (departure?.isValid && returnDate?.isValid) {
    return `https://www.skyscanner.ro/transport/zboruri/${originCode.toLowerCase()}/${destinationCode.toLowerCase()}/${departure.toFormat(
      "yyLLdd",
    )}/${returnDate.toFormat(
      "yyLLdd",
    )}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=1&outboundaltsenabled=false&inboundaltsenabled=false&preferdirects=false`;
  }

  if (departure?.isValid) {
    return `https://www.skyscanner.ro/transport/zboruri/${originCode.toLowerCase()}/${destinationCode.toLowerCase()}/${departure.toFormat(
      "yyLLdd",
    )}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=0&outboundaltsenabled=false&inboundaltsenabled=false&preferdirects=false`;
  }

  return `https://www.skyscanner.ro/transport/zboruri/${originCode.toLowerCase()}/${destinationCode.toLowerCase()}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&preferdirects=false`;
}

export default function RouteDetailsClient({
  destinationCode,
  destinationCountryName,
  destinationName,
  distanceKm,
  estimatedFlightTime,
  originCode,
  originCountryName,
  originName,
}: RouteDetailsClientProps) {
  const searchParams = useSearchParams();
  const [resolvedAirlineName, setResolvedAirlineName] = useState<string | null>(
    null,
  );
  const [resolvedDistanceKm, setResolvedDistanceKm] = useState<number | null>(
    distanceKm,
  );

  const departureAt = searchParams.get("departure_at");
  const returnAt = searchParams.get("return_at");
  const price = searchParams.get("price");
  const airline = searchParams.get("airline");
  const flightNumber = searchParams.get("flight_number");
  const transfers = searchParams.get("transfers");
  const returnTransfers = searchParams.get("return_transfers");

  const departureDateLabel = formatShortDate(departureAt);
  const returnDateLabel = formatShortDate(returnAt);
  const departureDateTimeLabel = formatFullDateTime(departureAt);
  const returnDateTimeLabel = formatFullDateTime(returnAt);
  const tripLength = formatTripLength(departureAt, returnAt);
  const outboundTransfers = formatTransferCount(transfers);
  const inboundTransfers = formatTransferCount(returnTransfers);
  const tripType = returnAt ? "Round-trip" : "One-way";
  const distanceLabel = formatDistance(resolvedDistanceKm);
  const aviasalesUrl = buildAviasalesUrl(
    originCode,
    destinationCode,
    departureAt,
    returnAt,
  );
  const kiwiUrl = buildKiwiUrl(
    originName,
    originCountryName,
    destinationName,
    destinationCountryName,
    departureAt,
    returnAt,
  );
  const skyscannerUrl = buildSkyscannerUrl(
    originCode,
    destinationCode,
    departureAt,
    returnAt,
  );
  const destinationImageUrl = `/api/city-image?city=${encodeURIComponent(
    destinationName,
  )}`;

  useEffect(() => {
    let cancelled = false;

    async function resolveDistance() {
      const effectiveOriginCode = searchParams.get("origin_code") || originCode;
      const effectiveDestinationCode =
        searchParams.get("destination_code") || destinationCode;

      if (!effectiveOriginCode || !effectiveDestinationCode) return;

      try {
        const [originRes, destinationRes] = await Promise.all([
          fetch(
            `/api/places?term=${encodeURIComponent(effectiveOriginCode)}&locale=en`,
          ),
          fetch(
            `/api/places?term=${encodeURIComponent(effectiveDestinationCode)}&locale=en`,
          ),
        ]);

        if (!originRes.ok || !destinationRes.ok) return;

        const [originPlaces, destinationPlaces]: [Place[], Place[]] =
          await Promise.all([originRes.json(), destinationRes.json()]);

        const originCoordinates = pickPlaceWithCoordinates(
          originPlaces,
          effectiveOriginCode,
        );
        const destinationCoordinates = pickPlaceWithCoordinates(
          destinationPlaces,
          effectiveDestinationCode,
        );

        const computedDistance = haversineKm(
          originCoordinates?.latitude,
          originCoordinates?.longitude,
          destinationCoordinates?.latitude,
          destinationCoordinates?.longitude,
        );

        if (!cancelled && computedDistance) {
          setResolvedDistanceKm(computedDistance);
        }
      } catch {
        // Keep server fallback if client enrichment fails.
      }
    }

    void resolveDistance();

    return () => {
      cancelled = true;
    };
  }, [destinationCode, originCode, searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function resolveAirlineName() {
      if (!airline) {
        setResolvedAirlineName(null);
        return;
      }

      if (airline.length > 3) {
        setResolvedAirlineName(airline);
        return;
      }

      try {
        const res = await fetch(
          `/api/airline?code=${encodeURIComponent(airline)}`,
        );
        if (!res.ok) return;
        const data: { name: string | null } = await res.json();
        if (!cancelled) {
          setResolvedAirlineName(data.name || airline);
        }
      } catch {
        if (!cancelled) {
          setResolvedAirlineName(airline);
        }
      }
    }

    void resolveAirlineName();

    return () => {
      cancelled = true;
    };
  }, [airline]);

  const directFlightEstimate =
    estimateFlightTime(resolvedDistanceKm) || estimatedFlightTime;

  const compactFacts = [
    `${tripType} flight`,
    departureDateTimeLabel || null,
    returnDateTimeLabel ? `Return ${returnDateTimeLabel}` : null,
    tripLength ? `Trip length ${tripLength}` : null,
    distanceLabel ? `Distance ${distanceLabel}` : null,
    directFlightEstimate ? `Approx. direct time ${directFlightEstimate}` : null,
    outboundTransfers ? `Outbound ${outboundTransfers.toLowerCase()}` : null,
    inboundTransfers ? `Inbound ${inboundTransfers.toLowerCase()}` : null,
    resolvedAirlineName ? `Airline ${resolvedAirlineName}` : null,
    flightNumber ? `Flight ${flightNumber}` : null,
    price ? `From ${price} EUR` : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <div className={styles.ctaPanel}>
        <div className={styles.panelImageBlock}>
          <Image
            src={destinationImageUrl}
            alt={`${destinationName} city view`}
            fill
            className={styles.panelImage}
            sizes="(max-width: 879px) 100vw, 320px"
            unoptimized
          />
        </div>
        <div className={styles.panelContent}>
          <h2 className={styles.panelTitle}>Search this route on travel sites</h2>
          <p className={styles.panelLead}>
            Compare prices for flights from {originName} to {destinationName} on
            major travel platforms.
          </p>
          <div className={styles.providerButtons}>
            <a
              className={`${styles.ctaButton} ${styles.aviasalesButton}`}
              href={aviasalesUrl}
              target="_blank"
              rel="noreferrer"
            >
              Aviasales
            </a>
            <a
              className={`${styles.ctaButton} ${styles.kiwiButton}`}
              href={kiwiUrl}
              target="_blank"
              rel="noreferrer"
            >
              Kiwi.com
            </a>
            <a
              className={`${styles.ctaButton} ${styles.skyscannerButton}`}
              href={skyscannerUrl}
              target="_blank"
              rel="noreferrer"
            >
              Skyscanner
            </a>
          </div>
          <div className={styles.compactFacts}>
            {compactFacts.map((fact) => (
              <p key={fact} className={styles.compactFact}>
                {fact}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.copyGrid}>
        <section className={styles.copyBlock}>
          <h2 className={styles.copyTitle}>
            Route guide for flights from {originName} to {destinationName}
          </h2>
          <p className={styles.copyText}>
            Flights from {originName} to {destinationName} are useful for city
            breaks, business trips, and flexible low-cost travel planning.
            Comparing cheap flights, nearby dates, and direct availability can
            help you find stronger fares on this route.
          </p>
          <p className={styles.copyText}>
            If you are searching for the best flight deals from {originName} to{" "}
            {destinationName}, compare one-way and round-trip options, review
            live prices, and check the latest dates before booking.
          </p>
        </section>

        <section className={styles.copyBlock}>
          <h2 className={styles.copyTitle}>
            What to know before booking this route
          </h2>
          <p className={styles.copyText}>
            This page shows route-level information based on available flight
            data, including city names, airport codes, fare level, estimated
            distance, and timing details when present. That makes the page
            useful both for search discovery and for users comparing routes
            quickly.
          </p>
          <p className={styles.copyText}>
            Route distance from {originName} to {destinationName}
            {distanceLabel
              ? ` is about ${distanceLabel}`
              : " is shown when location data is available"}
            , and
            {directFlightEstimate
              ? ` a typical direct-flight estimate is around ${directFlightEstimate}.`
              : " direct flight time is estimated when location data is available."}
          </p>
        </section>
      </div>
    </>
  );
}
