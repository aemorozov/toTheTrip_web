import Link from "next/link";
import styles from "./Navigation.module.css";

export default function Navigation() {
  return (
    <Link href={"/"} className={styles.link}>
      <nav className={styles.navigation}>
        <div className={styles.logoText}>
          <p className={styles.logo}>toTheTrip.app</p>
          <p className={styles.description}>Cheapest flights in one click.</p>
        </div>
      </nav>
    </Link>
  );
}
