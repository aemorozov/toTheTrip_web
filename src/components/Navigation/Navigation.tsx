import styles from "./Navigation.module.css";

export default function Navigation() {
  return (
    <nav className={styles.navigation}>
      <div className={styles.logoText}>
        <p className={styles.logo}>toTheTrip.app</p>
        <p className={styles.description}>we already found cheapest flights.</p>
      </div>
    </nav>
  );
}
