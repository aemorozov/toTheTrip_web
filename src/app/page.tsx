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
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData),
        }}
      />
      <HeroBlock />
      <RandomFlightsBlock />
      <section className={styles.seoSection} aria-labelledby="home-seo-title">
        <div className={styles.seoHeader}>
          <h2 id="home-seo-title">
            Explore real <span className={styles.orange}>cheap flight deals</span>{" "}
            from your city
          </h2>
          <p className={styles.seoLead}>
            Compare flight deals by departure city, then open route pages with
            more detailed travel information and outbound search options.
          </p>
        </div>
        <div className={styles.contentBlock}>
          <div className={styles.imageBlock}>
            <Image
              className={styles.image}
              src={seoPicture}
              alt="Cheap flights and destination ideas from your city"
              loading="eager"
            />
          </div>
          <div className={styles.textBlock}>
            <p>
              <strong className={styles.orange}>toTheTrip</strong> helps
              travelers compare cheap flights from their city in one place. You
              can browse real route ideas, check low fares, and open route pages
              with extra details for one-way, round-trip, and weekend travel.
            </p>
            <p>
              Instead of searching destinations one by one, use the platform to
              compare cheap airline tickets, popular city-break routes, and
              budget travel options from major departure cities across Europe.
            </p>
            <p>
              Whether you are looking for a quick getaway or planning ahead,
              toTheTrip makes it easier to discover cheap flights, compare
              airfare options, and spot useful destination pages before booking.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
