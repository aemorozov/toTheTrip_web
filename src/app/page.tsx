import { Metadata } from "next";
import { HeroBlock } from "../components/HeroBlock/HeroBlock";
import { RandomFlightsBlock } from "../components/RandomFlightsBlock/RandomFlightsBlock";
import styles from "./page.module.css";
import { homeMetadata, homeStructuredData } from "../lib/seo";

export const metadata: Metadata = homeMetadata;

export default function HomePage() {
  return (
    <>
      <main className={styles.main}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homeStructuredData),
          }}
        />
        <HeroBlock />
        <RandomFlightsBlock />

        <section className={styles.seoSection}>
          <h2>
            How to find <span className={styles.orange}>cheap flights</span>{" "}
            faster?
          </h2>
          <div className={styles.contentBlock}>
            <p>
              toTheTrip helps travelers quickly discover the cheapest flights
              available from their city. Instead of searching dozens of routes
              and dates manually, you can explore real flight deals that were
              our system already found .
            </p>

            <p>
              Simply choose your departure city and browse destinations where
              cheap airline tickets are currently available. The platform
              highlights the lowest prices, making it easy to find affordable
              weekend trips, budget travel ideas, and spontaneous getaways.
            </p>

            <p>
              Whether you're looking for a quick city break or planning your
              next trip, ToTheTrip lets you discover cheap flights, explore new
              destinations, and find low airfare deals in seconds.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
