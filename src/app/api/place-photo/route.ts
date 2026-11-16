import { type NextRequest, NextResponse } from "next/server";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref || !KEY) return new NextResponse(null, { status: 400 });

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${KEY}`;

  const res = await fetch(url);
  if (!res.ok) return new NextResponse(null, { status: 404 });

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
      // 写真は変わらないので長めにキャッシュ（ブラウザ1週間・CDN30日）。2回目以降は即表示
      "Cache-Control": "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400, immutable",
    },
  });
}
