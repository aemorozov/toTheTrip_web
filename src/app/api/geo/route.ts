import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Enter to api/geo");

  try {
    // 1️⃣ Получаем IP из заголовков

    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");

    let ip = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    console.log("ip >>>", ip);

    // fallback для локальной разработки
    if (!ip || ip === "::1") {
      ip = "63.116.61.253";
    }

    // 2️⃣ Запрос к ipwho.is
    const res = await fetch(`https://ipwho.is/${ip}`, {
      cache: "no-store",
    });

    const data = await res.json();

    console.log("data >>>", data);

    if (!data.success) {
      return NextResponse.json({
        city: "Buh",
        country: null,
      });
    }

    return NextResponse.json({
      city: data.city ?? null,
      country: data.country ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    });
  } catch (error) {
    console.error("Geo API error:", error);

    return NextResponse.json({
      city: null,
      country: null,
    });
  }
}
