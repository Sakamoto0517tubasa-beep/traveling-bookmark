import { type NextRequest, NextResponse } from "next/server";

export type PlaceResult = {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  user_ratings_total: number;
  photo_ref: string | null;
  types: string[];
};

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// 場所名で検索（Places Text Search）。searchParams を読むため動的実行。
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || !KEY) return NextResponse.json([], { status: 400 });

  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(q)}` +
    `&language=ja` +
    `&key=${KEY}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: string;
      results: {
        place_id: string;
        name: string;
        formatted_address?: string;
        rating?: number;
        user_ratings_total?: number;
        photos?: { photo_reference: string }[];
        types: string[];
        geometry: { location: { lat: number; lng: number } };
      }[];
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("TextSearch error:", data.status);
      return NextResponse.json([]);
    }

    const results: PlaceResult[] = (data.results ?? [])
      .slice(0, 10)
      .map((p) => ({
        place_id: p.place_id,
        name: p.name,
        address: p.formatted_address ?? "",
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        rating: p.rating ?? null,
        user_ratings_total: p.user_ratings_total ?? 0,
        photo_ref: p.photos?.[0]?.photo_reference ?? null,
        types: p.types,
      }));

    return NextResponse.json(results);
  } catch (e) {
    console.error("search-place error:", e);
    return NextResponse.json([]);
  }
}
