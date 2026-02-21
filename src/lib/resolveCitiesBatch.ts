const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

// === Универсальная функция для Redis REST API ===
async function redisRequest(
  method: string,
  key: string,
  value: string | null = null,
) {
  const url = `${UPSTASH_REDIS_REST_URL}/${method}/${encodeURIComponent(
    key,
  )}${value ? `/${encodeURIComponent(value)}` : ""}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });

  return res.json();
}

type CityMap = Record<string, string | null>;

export async function resolveCitiesBatch(codes: string[]): Promise<CityMap> {
  const uniqueCodes = [...new Set(codes)];
  const cityMap: CityMap = {};

  if (uniqueCodes.length === 0) return {};

  // 🔹 1. Загружаем airports2 (code → city)
  let airports2: Record<string, string> = {};
  let airports: Record<string, string> = {};

  try {
    const json1 = await redisRequest("get", "airports2");
    airports2 = json1?.result ? JSON.parse(json1.result) : {};

    const json2 = await redisRequest("get", "airports");
    airports = json2?.result ? JSON.parse(json2.result) : {};
  } catch (err) {
    console.warn("⚠️ Redis read error:", err);
  }

  // 🔹 2. Проверяем какие коды уже есть
  const missingCodes: string[] = [];

  uniqueCodes.forEach((code) => {
    if (airports2[code]) {
      cityMap[code] = airports2[code];
    } else {
      missingCodes.push(code);
    }
  });

  // 🔹 3. Если есть отсутствующие — идём в places2
  if (missingCodes.length > 0) {
    const resolvedMissing = await Promise.all(
      missingCodes.map(async (code) => {
        try {
          const res = await fetch(
            `https://autocomplete.travelpayouts.com/places2?term=${code}&locale=en&types[]=city&types[]=airport`,
          );

          if (!res.ok) return [code, null];

          const data = await res.json();

          const city =
            data.find((p: any) => p.type === "city")?.name ||
            data.find((p: any) => p.type === "airport")?.city_name ||
            null;

          return [code, city];
        } catch {
          return [code, null];
        }
      }),
    );

    // 🔹 4. Обновляем локальные объекты
    resolvedMissing.forEach(([code, city]) => {
      cityMap[code] = city;

      if (city) {
        airports2[code] = city;
        airports[city] = code;
      }
    });

    // 🔹 5. Сохраняем обратно в Redis
    try {
      await redisRequest("set", "airports2", JSON.stringify(airports2));
      await redisRequest("set", "airports", JSON.stringify(airports));
      console.log("💾 Updated airports cache in Redis");
    } catch (err) {
      console.warn("⚠️ Redis write error:", err);
    }
  }

  return cityMap;
}
