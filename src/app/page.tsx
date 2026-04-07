import { Metadata } from "next";
import { HeroBlock } from "../components/HeroBlock/HeroBlock";
import { RandomFlightsBlock } from "../components/RandomFlightsBlock/RandomFlightsBlock";
import styles from "./page.module.css";
import { homeMetadata, homeStructuredData } from "../lib/seo";
import Image from "next/image";
import seoPicture from "../images/seoPicture.jpg";

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

        {/* <section className={styles.seoSection}>
          <h2>
            Explore real{" "}
            <span className={styles.orange}>cheap flight deals</span> from your
            city
          </h2>
          <div className={styles.contentBlock}>
            <div className={styles.imageBlock}>
              <Image
                className={styles.image}
                src={seoPicture}
                alt="toTheTrip - cheapets flights in one click"
                loading="eager"
              />
            </div>
            <div className={styles.textBlock}>
              <p>
                <strong className={styles.orange}>toTheTrip</strong> helps
                travelers quickly discover the cheapest flights available from
                their city. Instead of searching dozens of routes and dates
                manually, you can explore{" "}
                <strong className={styles.orange}>real flight deals</strong>{" "}
                that were our system already found .
              </p>

              <p>
                Simply choose your departure city and browse destinations where
                cheap airline tickets are currently available. The platform{" "}
                <strong className={styles.orange}>
                  highlights the lowest prices
                </strong>
                , making it easy to find affordable weekend trips, budget travel
                ideas, and spontaneous getaways.
              </p>

              <p>
                Whether you're looking for a quick city break or planning your
                next trip, <strong className={styles.orange}>toTheTrip</strong>{" "}
                lets you discover cheap flights, explore new destinations, and
                find low airfare deals in seconds.
              </p>
            </div>
          </div>
        </section> */}
      </main>
    </>
  );
}
