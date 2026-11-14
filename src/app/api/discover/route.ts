import { type NextRequest, NextResponse } from "next/server";
import type { NearbyPlace } from "../nearby/route";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// 観光施設の分類 → Google Places の type / keyword（複数を合算して多く集める）
const CATEGORY_CONFIG: Record<string, { types?: string[]; keyword?: string }> = {
  history: { types: ["museum", "art_gallery", "place_of_worship"] }, // 歴史・文化
  nature: { types: ["park", "natural_feature"], keyword: "展望台" }, // 自然観光
  leisure: { types: ["amusement_park", "zoo", "aquarium"] }, // レジャー
  experience: { types: ["tourist_attraction"], keyword: "体験" }, // 体験型
  shopping: { types: ["shopping_mall", "department_store", "store"] }, // 商業・ショッピング
  onsen: { types: ["spa"], keyword: "温泉" }, // 温浴・リゾート
  entertainment: { types: ["movie_theater", "night_club", "bowling_alley"] }, // エンタメ
  sports: { types: ["gym", "stadium"] }, // スポーツ・アクティビティ
  food: { types: ["restaurant", "bakery", "bar"] }, // 飲食・食文化
  landmark: { types: ["tourist_attraction"] }, // 景観・ランドマーク
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type RawPlace = {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: { open_now: boolean };
  photos?: { photo_reference: string }[];
  types: string[];
  geometry: { location: { lat: number; lng: number } };
};

// 1つの検索条件（type または keyword）で最大2ページ取得
async function fetchQuery(
  lat: string,
  lng: string,
  radius: number,
  q: { type?: string; keyword?: string },
): Promise<RawPlace[]> {
  const out: RawPlace[] = [];
  const params =
    `location=${lat},${lng}&radius=${radius}&language=ja` +
    (q.type ? `&type=${q.type}` : "") +
    (q.keyword ? `&keyword=${encodeURIComponent(q.keyword)}` : "") +
    `&key=${GOOGLE_MAPS_KEY}`;
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
  for (let page = 0; page < 2; page++) {
    try {
      const res = await fetch(url);
      const data = (await res.json()) as {
        status: string;
        results?: RawPlace[];
        next_page_token?: string;
      };
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Discover API error:", data.status);
        break;
      }
      out.push(...(data.results ?? []));
      if (!data.next_page_token) break;
      await sleep(2000); // next_page_token は発行直後は使えない
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${data.next_page_token}&key=${GOOGLE_MAPS_KEY}`;
    } catch (e) {
      console.error("Discover fetch error:", e);
      break;
    }
  }
  return out;
}

// 地図で見ているエリアの観光施設を分類別にまとめて取得。
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const category = searchParams.get("category") ?? "landmark";
  const radius = Math.min(
    50000,
    Math.max(500, parseInt(searchParams.get("radius") ?? "3000", 10) || 3000),
  );

  if (!lat || !lng || !GOOGLE_MAPS_KEY) {
    return NextResponse.json([], { status: 400 });
  }

  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.landmark;
  const queries: { type?: string; keyword?: string }[] = [];
  for (const t of cfg.types ?? []) queries.push({ type: t });
  if (cfg.keyword) queries.push({ keyword: cfg.keyword });

  // 各条件を並列取得（最大3条件 × 2ページ）
  const results = await Promise.all(
    queries.slice(0, 3).map((q) => fetchQuery(lat, lng, radius, q)),
  );
  const raw = results.flat();

  // place_id で重複除去
  const seen = new Set<string>();
  const places: NearbyPlace[] = [];
  for (const p of raw) {
    if (!p.place_id || seen.has(p.place_id)) continue;
    seen.add(p.place_id);
    places.push({
      place_id: p.place_id,
      name: p.name,
      vicinity: p.vicinity ?? "",
      rating: p.rating ?? null,
      user_ratings_total: p.user_ratings_total ?? 0,
      price_level: p.price_level ?? null,
      open_now: p.opening_hours?.open_now ?? null,
      photo_ref: p.photos?.[0]?.photo_reference ?? null,
      types: p.types ?? [],
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
    });
  }

  return NextResponse.json(places);
}
