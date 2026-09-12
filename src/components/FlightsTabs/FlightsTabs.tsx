"use client";

import { useSearchParams } from "next/navigation";
import FlightsMainBlock from "../FlightsMainBlock/FlightsMainBlock";
import styles from "./FlightsTabs.module.css";

type Duration = "short" | "week" | "weekend";

type Props = {
  origin: string;
};

export default function FlightsTabs({ origin }: Props) {
  const searchParams = useSearchParams();
  const requestedTrip = searchParams.get("trip");
  const requestedMonth = searchParams.get("month");
  const requestedDuration = searchParams.get("duration");
  const trip =
    requestedTrip === "roundTrip" ? "roundTrip" : "oneWay";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth ?? "")
    ? requestedMonth
    : null;
  const duration: Duration | null =
    requestedDuration === "short" ||
    requestedDuration === "week" ||
    requestedDuration === "weekend"
      ? requestedDuration
      : null;
  return (
    <div className={styles.tabPanel}>
      <FlightsMainBlock
        origin={origin}
        parameters={trip}
        month={month}
        duration={duration}
      />
    </div>
  );
}
