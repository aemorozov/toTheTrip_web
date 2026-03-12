import { NextResponse } from "next/server";

const PEXELS_API_KEY = process.env.PEXEL_KEY;

const SIBERIA = [
  "Krasnoyarsk",
  "Novosibirsk",
  "Irkutsk",
  "Kemerovo",
  "Tomsk",
  "Tyumen",
  "Omsk",
  "Barnaul",
  "Novokuznetsk",
  "Chita",
  "Ulan-Ude",
  "Bratsk",
];

const URAL = [
  "Yekaterinburg",
  "Chelyabinsk",
  "Perm",
  "Ufa",
  "Magnitogorsk",
  "Nizhny Tagil",
  "Sterlitamak",
  "Orsk",
  "Miass",
  "Kurgan",
  "Salavat",
];

const VOLGA = [
  "Kazan",
  "Samara",
  "Nizhny Novgorod",
  "Ulyanovsk",
  "Saratov",
  "Volgograd",
  "Orenburg",
  "Penza",
  "Tolyatti",
  "Izhevsk",
  "Yoshkar-Ola",
  "Kirov",
  "Cheboksary",
  "Astrakhan",
];

const FAR_EAST = [
  "Vladivostok",
  "Khabarovsk",
  "Yakutsk",
  "Magadan",
  "Yuzhno-Sakhalinsk",
  "Petropavlovsk-Kamchatsky",
  "Anadyr",
  "Birobidzhan",
  "Blagoveshchensk",
  "Nakhodka",
];

const NORTHWEST = [
  "Murmansk",
  "Arkhangelsk",
  "Petrozavodsk",
  "Pskov",
  "Kaliningrad",
  "Novgorod",
  "Vologda",
  "Cherepovets",
  "Syktyvkar",
];

const CAUCASUS = [
  "Makhachkala",
  "Grozny",
  "Nalchik",
  "Vladikavkaz",
  "Stavropol",
  "Pyatigorsk",
  "Kislovodsk",
  "Mineralnye Vody",
  "Cherkessk",
];

type ResolvedCity = {
  city: string;
  country: string;
};

async function resolveCityViaAviasales(
  city: string,
): Promise<ResolvedCity | null> {
  try {
    const params = new URLSearchParams();
    params.set("locale", "en");
    params.append("types[]", "city");
    params.set("term", city);

    const res = await fetch(
      `https://places.aviasales.com/v2/places.json?${params.toString()}`,
      { next: { revalidate: 86400 } },
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const item = data[0];
    return {
      city: item.name,
      country: item.country_name,
    };
  } catch {
    return null;
  }
}

function buildQuery(cityName: string, countryName: string) {
  let regionQuery: string | null = null;

  if (SIBERIA.includes(cityName)) regionQuery = "Siberia";
  if (URAL.includes(cityName)) regionQuery = "Ural";
  if (VOLGA.includes(cityName)) regionQuery = "Volga";
  if (FAR_EAST.includes(cityName)) regionQuery = "Far East Russia";
  if (NORTHWEST.includes(cityName)) regionQuery = "Northwest Russia";
  if (CAUCASUS.includes(cityName)) regionQuery = "Caucasus Russia";

  if (countryName === "Russia") {
    countryName = "";
  }

  if (regionQuery) return regionQuery;
  if (countryName) return `${cityName} ${countryName} landmarks`;
  return `${cityName} landmarks`;
}

export async function GET(request: Request) {
  try {
    if (!PEXELS_API_KEY) {
      return NextResponse.json(
        { error: "PEXELS API key missing" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const cityParam = searchParams.get("city");

    if (!cityParam) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const resolved = (await resolveCityViaAviasales(cityParam)) || {
      city: cityParam,
      country: "",
    };

    const query = buildQuery(resolved.city, resolved.country);

    const params = new URLSearchParams({
      query,
      per_page: "1",
      orientation: "landscape",
    });

    const searchRes = await fetch(
      `https://api.pexels.com/v1/search?${params.toString()}`,
      {
        headers: { Authorization: PEXELS_API_KEY },
        next: { revalidate: 86400 },
      },
    );

    if (!searchRes.ok) {
      return NextResponse.json(
        { error: "Pexels search failed" },
        { status: 502 },
      );
    }

    const searchJson = await searchRes.json();
    const photos = searchJson?.photos || [];
    if (!photos.length) {
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
    }

    const bestPhoto = photos[Math.floor(Math.random() * photos.length)];
    const url: string | undefined =
      bestPhoto?.src?.medium || bestPhoto?.src?.small;
    if (!url) {
      return NextResponse.json(
        { error: "Invalid photo source" },
        { status: 404 },
      );
    }

    const imageRes = await fetch(url, { next: { revalidate: 86400 } });
    if (!imageRes.ok || !imageRes.body) {
      return NextResponse.json(
        { error: "Image fetch failed" },
        { status: 502 },
      );
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageRes.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
