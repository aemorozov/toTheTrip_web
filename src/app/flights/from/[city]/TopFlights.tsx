import styles from "./TopFlights.module.css";

type Flight = {
  destination: string;
  departure_at: string;
  return_at: string;
  price: number;
  airline: string;
  flight_number: number;
};

type ApiResponse = {
  data: Flight[];
};

type Props = {
  origin: string; // IATA code
};

export default async function TopFlights({ origin }: Props) {
  const params = new URLSearchParams({
    currency: "eur",
    origin,
    unique: "true",
    sorting: "price",
    direct: "true",
    one_way: "false",
    limit: "10",
    token: process.env.TRAVELPAYOUTS_API_TOKEN as string,
  });

  const res = await fetch(
    `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`,
    {
      next: { revalidate: 3600 }, // 1 час
    },
  );

  console.log("res: ", res);

  if (!res.ok) {
    return <p>Unable to load flights.</p>;
  }

  const json: ApiResponse = await res.json();

  if (!json?.data?.length) {
    return <p>No cheap flights found.</p>;
  }

  return (
    <section>
      <h2>Top 10 cheapest direct flights</h2>

      {json.data.map((flight, index) => (
        <div className={styles.flight} key={index}>
          <strong>
            {origin} → {flight.destination}
          </strong>{" "}
          <br />€{flight.price} <br />
          Departure: {new Date(flight.departure_at).toLocaleDateString()} <br />
          Return: {new Date(flight.return_at).toLocaleDateString()} <br />
          Airline: {flight.airline} {flight.flight_number}
        </div>
      ))}
    </section>
  );
}
