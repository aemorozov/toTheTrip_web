import styles from "./FlightBlock.module.css";
import { DateTime } from "luxon";

export default function FlightBlock({ flight }) {
  const destination_iata = flight.destination;
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

  const searchPath = `${flight.origin}${DateTime.fromISO(flight.departure_at, {
    setZone: true,
  }).toFormat("ddMM")}${destination_iata}${DateTime.fromISO(flight.return_at, {
    setZone: true,
  }).toFormat("ddMM")}1`;
  const baseUrl = `https://www.aviasales.com/search/${searchPath}?currency=EUR`;
  const encodedUrl = encodeURIComponent(baseUrl);
  const link = `https://tp.media/r?marker=59890&trs=443711&p=4114&u=${encodedUrl}&campaign_id=100`;

  return (
    <a href={link} target="_blank" className={styles.link}>
      <div className={styles.flight}>
        <div className={styles.flightsInfo}>
          <div className={styles.cities}>
            <strong>{flight.destinationCity || flight.destination}</strong>
          </div>
          <div className={styles.infoText}>
            Dep: {departure_date}, {departure_time}{" "}
            {depart_transfers ? ` (${depart_transfers})` : null}
          </div>
          {flight.return_at ? (
            <div className={styles.infoText}>
              Ret: {return_date}, {return_time}{" "}
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
    </a>
  );
}
