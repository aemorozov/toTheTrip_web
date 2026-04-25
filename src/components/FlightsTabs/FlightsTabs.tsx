"use client";

import { useState } from "react";
import FlightsMainBlock from "../FlightsMainBlock/FlightsMainBlock";
import styles from "./FlightsTabs.module.css";

type TabId = "roundTrip" | "oneWay" | "weekendTrips";

const tabs: { id: TabId; label: string }[] = [
  { id: "oneWay", label: "One way" },
  { id: "roundTrip", label: "Round trip" },
  { id: "weekendTrips", label: "Weekend trips" },
];

type Props = {
  origin: string;
};

export default function FlightsTabs({ origin }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("oneWay");

  return (
    <>
      <div className={styles.tabList} role="tablist" aria-label="Flight types">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabButton} ${isActive ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className={styles.tabPanel} role="tabpanel">
        <FlightsMainBlock
          key={activeTab}
          origin={origin}
          parameters={activeTab}
        />
      </div>
    </>
  );
}
