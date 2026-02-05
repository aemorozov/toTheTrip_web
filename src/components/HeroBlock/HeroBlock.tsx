import styles from "./HeroBlock.module.css";

export function HeroBlock() {
  return (
    <section className={styles.heroBlock}>
      <div className={styles.heroForm}>
        <label htmlFor="city" className={styles.heroLabel}>
          I want tickets from
        </label>
        <input
          id="city"
          type="text"
          placeholder="Bucharest"
          className={styles.heroInput}
        />
        <button className={styles.searchButton}>Click</button>
      </div>
      <div className={styles.leftBlock}>
        <h1>The cheapest flights from your city</h1>

        <p className={styles.heroDescription}>
          <strong>toTheTrip</strong> - a service for finding the cheapest
          flights. Find out where <strong>the cheapest flights</strong> from
          your city are without a complicated search..
        </p>

        <p className={styles.heroDescription}>
          We collect the cheapest flights found by other users from various
          cities across all destinations and dates.
        </p>
      </div>
    </section>
  );
}
