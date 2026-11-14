import { type NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export type PlaceDetails = {
  place_id: string | null;
  name: string;
  editorial_summary: string | null; // Google の公式概要（解説）
  rating: number | null;
  user_ratings_total: number;
  address: string | null;
  website: string | null;
  maps_url: string | null;
  phone: string | null;
  weekday_text: string[]; // 営業時間（曜日別）
  types: string[];
};

// 名前から place_id を解決（既存スポットなど place_id を持たない場合用）
async function findPlaceId(q: string): Promise<string | null> {
  const url =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${encodeURIComponent(q)}&inputtype=textquery&fields=place_id&language=ja&key=${GOOGLE_MAPS_KEY}`;
  try {
    const res = await fetch(url);
    const data = (await res.json()) as { candidates?: { place_id: string }[] };
    return data.candidates?.[0]?.place_id ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  let placeId = searchParams.get("place_id");
  const q = searchParams.get("q");

  if (!GOOGLE_MAPS_KEY) return NextResponse.json(null, { status: 400 });
  if (!placeId && q) placeId = await findPlaceId(q);
  if (!placeId) return NextResponse.json(null);

  const fields = [
    "place_id",
    "name",
    "editorial_summary",
    "rating",
    "user_ratings_total",
    "formatted_address",
    "website",
    "url",
    "international_phone_number",
    "opening_hours",
    "types",
  ].join(",");

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=${fields}&language=ja&key=${GOOGLE_MAPS_KEY}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: string;
      result?: {
        place_id?: string;
        name?: string;
        editorial_summary?: { overview?: string };
        rating?: number;
        user_ratings_total?: number;
        formatted_address?: string;
        website?: string;
        url?: string;
        international_phone_number?: string;
        opening_hours?: { weekday_text?: string[] };
        types?: string[];
      };
    };
    if (data.status !== "OK" || !data.result) return NextResponse.json(null);
    const p = data.result;
    const details: PlaceDetails = {
      place_id: p.place_id ?? placeId,
      name: p.name ?? "",
      editorial_summary: p.editorial_summary?.overview ?? null,
      rating: p.rating ?? null,
      user_ratings_total: p.user_ratings_total ?? 0,
      address: p.formatted_address ?? null,
      website: p.website ?? null,
      maps_url: p.url ?? null,
      phone: p.international_phone_number ?? null,
      weekday_text: p.opening_hours?.weekday_text ?? [],
      types: p.types ?? [],
    };
    return NextResponse.json(details);
  } catch (e) {
    console.error("Place details error:", e);
    return NextResponse.json(null);
  }
}
