import styles from "./page.module.css";

type PageProps = {
  params: Promise<{ city: string }>;
};

type Place = {
  type: "city";
  name: string;
  code?: string;
  country_name?: string;
};

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const citySlug = decodeURIComponent(city);

  const res = await fetch(
    `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
      citySlug,
    )}&types[]=city`,
    { cache: "no-store" },
  );

  const places: Place[] = await res.json();

  const matchedCity = places.find(
    (p) => p.type === "city" && p.name.toLowerCase() === citySlug.toLowerCase(),
  );

  return (
    <main className={styles.mainBlock}>
      <h1>
        Cheapest flights <br />
        from {matchedCity ? matchedCity.name : citySlug}
      </h1>

      {matchedCity ? (
        <p>Country: {matchedCity.country_name}</p>
      ) : (
        <p>We are showing results for a custom city entered by the user.</p>
      )}
    </main>
  );
}
