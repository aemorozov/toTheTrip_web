"use client";

import { useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import styles from "./FlightBlock.module.css";
import { DateTime } from "luxon";
import testImage from "../../images/test.jpg";

type Flight = {
  origin?: string;
  destination: string;
  departure_at: string;
  return_at?: string;
  price?: number;
  airline?: string;
  flight_number?: number;
  transfers?: number;
  return_transfers?: number;
  destinationCity?: string;
  originCity?: string;
};

type Props = {
  flight: Flight;
  origin?: string | null;
};

export default function FlightBlock({ flight, origin = null }: Props) {
  const slugify = (value: string): string =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const departure_date = DateTime.fromISO(flight.departure_at, {
    setZone: true,
  })
    .setLocale("en")
    .toFormat("ccc dd LLL");
  const departure_time = DateTime.fromISO(flight.departure_at, {
    setZone: true,
  }).toFormat("HH:mm");

  const depart_transfers = flight.transfers;

  const return_date = DateTime.fromISO(flight.return_at, {
    setZone: true,
  })
    .setLocale("en")
    .toFormat("ccc dd LLL");
  const return_time = DateTime.fromISO(flight.return_at, {
    setZone: true,
  }).toFormat("HH:mm");

  const return_transfers = flight.return_transfers;

  const destinationRaw = flight.destinationCity || flight.destination;
  const destinationName = destinationRaw.split(",")[0].trim();
  const originName = (flight.originCity || flight.origin || "")
    .split(",")[0]
    .trim();
  const cityImageSrc = `/api/city-image?city=${encodeURIComponent(
    destinationName,
  )}`;
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(cityImageSrc);

  const originSlug = slugify(originName || flight.origin || "");
  const destinationSlug = slugify(destinationName || flight.destination || "");
  const params = new URLSearchParams();

  params.set("departure_at", flight.departure_at);
  params.set("origin_code", flight.origin || "");
  params.set("destination_code", flight.destination || "");

  if (flight.price !== undefined) {
    params.set("price", String(flight.price));
  }

  if (flight.airline) {
    params.set("airline", flight.airline);
  }

  if (flight.flight_number !== undefined) {
    params.set("flight_number", String(flight.flight_number));
  }

  if (flight.transfers !== undefined) {
    params.set("transfers", String(flight.transfers));
  }

  if (flight.return_transfers !== undefined) {
    params.set("return_transfers", String(flight.return_transfers));
  }

  if (flight.originCity) {
    params.set("origin_city", flight.originCity);
  }

  if (flight.destinationCity) {
    params.set("destination_city", flight.destinationCity);
  }

  if (flight.return_at) {
    params.set("return_at", flight.return_at);
  }

  const detailsHref =
    originSlug && destinationSlug
      ? `/flights/from/${originSlug}/to/${destinationSlug}?${params.toString()}`
      : "/";

  return (
    <Link href={detailsHref} className={styles.link}>
      <div className={styles.flight}>
        <div className={styles.imageBlock}>
          <Image
            src={imgSrc}
            alt={`Cheap flight from ${originName} to ${destinationName}`}
            className={styles.image}
            fill
            sizes="(min-width: 880px) 260px, 70vw"
            unoptimized
            onError={() => setImgSrc(testImage)}
          />
        </div>
        <div className={styles.flightsData}>
          <div className={styles.flightsInfo}>
            <div className={styles.cities}>
              {origin ? (
                <strong>
                  {origin} ➔
                  <br />
                </strong>
              ) : null}
              <strong>{flight.destinationCity || flight.destination}</strong>
            </div>
            <div className={styles.infoText}>
              ➡️ {departure_date}, {departure_time}{" "}
              {depart_transfers ? ` (${depart_transfers})` : null}
            </div>
            {flight.return_at ? (
              <div className={styles.infoText}>
                ⬅️ {return_date}, {return_time}{" "}
                {return_transfers ? `${return_transfers}` : null}
              </div>
            ) : null}
          </div>
          <div className={styles.flightPrice}>
            <div>
              {flight.price}
              <small>€</small>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
