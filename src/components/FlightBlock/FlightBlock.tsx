import styles from "./FlightBlock.module.css";

export default function FlightBlock({ flight }) {
  return (
    <>
      <div className={styles.flight}>
        <div className={styles.flightsInfo}>
          <div className={styles.cities}>
            <strong>{flight.destinationCity || flight.destination}</strong>
          </div>
          <div className={styles.infoText}>
            Departure: {new Date(flight.departure_at).toLocaleDateString()}
          </div>
          {flight.return_at ? (
            <div className={styles.infoText}>
              Return: {new Date(flight.return_at).toLocaleDateString()}
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
    </>
  );
}
