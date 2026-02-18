import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Enter to api/geo");

  try {
    /* =========================
       1️⃣ Попытка взять geo из Edge (Vercel)
    ========================= */

    const edgeGeo = (req as any).geo;

    if (edgeGeo?.city) {
      console.log("Geo from Edge:", edgeGeo.city);

      return NextResponse.json({
        city: edgeGeo.city ?? null,
        country: edgeGeo.country ?? null,
        latitude: edgeGeo.latitude ?? null,
        longitude: edgeGeo.longitude ?? null,
        source: "edge",
      });
    }

    /* =========================
       2️⃣ Получаем IP из заголовков
    ========================= */

    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");

    let ip = forwardedFor?.split(",")[0]?.trim() || realIp || null;

    console.log("ip >>>", ip);

    // fallback для локальной разработки
    if (!ip || ip === "::1") {
      ip = "82.137.11.198"; // тестовый IP
    }

    /* =========================
       3️⃣ Попытка через ipwho.is
    ========================= */

    try {
      const res = await fetch(`https://ipwho.is/${ip}`, {
        cache: "no-store",
      });

      const data = await res.json();

      console.log("ipwho >>>", data);

      if (data.success) {
        return NextResponse.json({
          city: data.city ?? null,
          country: data.country ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          source: "ipwho",
        });
      }
    } catch (err) {
      console.log("ipwho failed");
    }

    /* =========================
       4️⃣ Финальный fallback — ip-api.com
    ========================= */

    try {
      const res = await fetch(`http://ip-api.com/json/${ip}`, {
        cache: "no-store",
      });

      const data = await res.json();

      console.log("ip-api >>>", data);

      if (data.status === "success") {
        return NextResponse.json({
          city: data.city ?? null,
          country: data.country ?? null,
          latitude: data.lat ?? null,
          longitude: data.lon ?? null,
          source: "ip-api",
        });
      }
    } catch (err) {
      console.log("ip-api failed");
    }

    /* =========================
       5️⃣ Полный fallback
    ========================= */

    return NextResponse.json({
      city: "New York 2",
      country: null,
      latitude: null,
      longitude: null,
      source: "fallback",
    });
  } catch (error) {
    console.error("Geo API error:", error);

    return NextResponse.json({
      city: "New York",
      country: null,
      latitude: null,
      longitude: null,
      source: "error",
    });
  }
}
