import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

interface IpApiResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
}

export async function GET(request: NextRequest) {
  const headersList = await headers();

  // Check for Vercel geo headers first (free on Vercel)
  const vercelCity = headersList.get("x-vercel-ip-city");

  if (vercelCity) {
    const city = vercelCity;
    const region = headersList.get("x-vercel-ip-country-region") || "";
    const country = headersList.get("x-vercel-ip-country") || "";
    const lat = headersList.get("x-vercel-ip-latitude") || "0";
    const lng = headersList.get("x-vercel-ip-longitude") || "0";

    return NextResponse.json({
      city: decodeURIComponent(city),
      region,
      country,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      formatted: `${decodeURIComponent(city)}${region ? `, ${region}` : ""}`,
    });
  }

  // Get IP from query param (passed by client after fetching from ipify)
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip") || "";

  try {
    // ip-api.com - free, no token needed, 45 requests/minute
    const url = ip ? `http://ip-api.com/json/${ip}` : "http://ip-api.com/json/";

    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data: IpApiResponse = await response.json();

    if (data.status === "success" && data.city) {
      return NextResponse.json({
        city: data.city,
        region: data.regionName,
        country: data.country,
        latitude: data.lat,
        longitude: data.lon,
        formatted: `${data.city}, ${data.regionName}`,
      });
    }
  } catch (error) {
    console.error("IP geolocation failed:", error);
  }

  return NextResponse.json({
    city: null,
    region: null,
    country: null,
    latitude: null,
    longitude: null,
    formatted: null,
  });
}
