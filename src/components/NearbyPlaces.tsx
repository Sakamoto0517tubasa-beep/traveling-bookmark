"use client";

import { useEffect, useRef, useState } from "react";
import {
  Star,
  Utensils,
  Landmark,
  Coffee,
  Hotel,
  Navigation,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import type { NearbyPlace } from "@/app/api/nearby/route";

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function PriceLevel({ level }: { level: number | null }) {
  if (level == null) return null;
  return (
    <span className="text-[11px] font-semibold text-emerald-600">
      {"¥".repeat(level)}
      <span className="text-gray-300">{"¥".repeat(Math.max(0, 4 - level))}</span>
    </span>
  );
}

function RatingStars({ rating, count }: { rating: number | null; count: number }) {
  if (rating == null) return <span className="text-[11px] text-gray-400">口コミなし</span>;
  return (
    <span className="flex items-center gap-0.5">
      <Star className="size-3 fill-amber-400 text-amber-400" />
      <span className="text-[11px] font-bold text-gray-700">{rating.toFixed(1)}</span>
      {count > 0 && (
        <span className="text-[11px] text-gray-400">({count.toLocaleString()})</span>
      )}
    </span>
  );
}

function photoUrl(ref: string): string {
  return `/api/place-photo?ref=${encodeURIComponent(ref)}`;
}

type Category = { key: string; label: string; icon: React.ReactNode; color: string };
const CATEGORIES: Category[] = [
  { key: "food", label: "飲食店", icon: <Utensils className="size-3.5" />, color: "text-orange-500" },
  { key: "cafe", label: "カフェ", icon: <Coffee className="size-3.5" />, color: "text-amber-600" },
  { key: "convenience", label: "コンビニ", icon: <ShoppingBag className="size-3.5" />, color: "text-emerald-600" },
  { key: "lodging", label: "宿泊", icon: <Hotel className="size-3.5" />, color: "text-rose-500" },
  { key: "sightseeing", label: "観光", icon: <Landmark className="size-3.5" />, color: "text-blue-500" },
];

const CATEGORY_BG: Record<string, string> = {
  food: "bg-orange-50",
  cafe: "bg-amber-50",
  convenience: "bg-emerald-50",
  lodging: "bg-rose-50",
  sightseeing: "bg-blue-50",
};
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  food: <Utensils className="size-6 text-orange-300" />,
  cafe: <Coffee className="size-6 text-amber-400" />,
  convenience: <ShoppingBag className="size-6 text-emerald-500" />,
  lodging: <Hotel className="size-6 text-rose-300" />,
  sightseeing: <Landmark className="size-6 text-blue-300" />,
};

function PlaceCard({
  place,
  spotLat,
  spotLng,
  category,
}: {
  place: NearbyPlace;
  spotLat: number;
  spotLng: number;
  category: string;
}) {
  const dist = calcDistance(spotLat, spotLng, place.lat, place.lng);
  const distLabel = dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`;
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${place.place_id}`;

  return (
    <div className="flex overflow-hidden rounded-md border border-line bg-white">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block size-24 shrink-0"
      >
        {place.photo_ref ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(place.photo_ref)}
            alt={place.name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className={`flex size-full items-center justify-center ${CATEGORY_BG[category] ?? "bg-gray-50"}`}>
            {CATEGORY_ICON[category]}
          </div>
        )}
        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {distLabel}
        </span>
      </a>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">{place.name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <RatingStars rating={place.rating} count={place.user_ratings_total} />
              <PriceLevel level={place.price_level} />
            </div>
            {place.vicinity && (
              <p className="mt-0.5 truncate text-[11px] text-gray-400">{place.vicinity}</p>
            )}
          </div>
          {place.open_now != null && (
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                place.open_now ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {place.open_now ? "営業中" : "時間外"}
            </span>
          )}
        </div>

        <div className="mt-2 flex gap-1.5">
          <a
            href={dirUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded border border-line bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-gray-100"
          >
            <Navigation className="size-3" />
            ルート
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded bg-navy px-3 py-1.5 text-[11px] font-bold text-white hover:opacity-90"
          >
            <ExternalLink className="size-3" />
            口コミを見る
          </a>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex overflow-hidden rounded-md border border-line bg-white">
          <div className="size-24 shrink-0 animate-pulse bg-gray-200" />
          <div className="flex-1 space-y-2 p-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NearbyPlaces({ lat, lng }: { lat: number; lng: number }) {
  const [activeCategory, setActiveCategory] = useState("food");
  const [cache, setCache] = useState<Record<string, NearbyPlace[]>>({});
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cache[activeCategory] !== undefined) return;
    setLoading(true);
    fetch(`/api/nearby?lat=${lat}&lng=${lng}&category=${activeCategory}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        const list = Array.isArray(data) ? (data as NearbyPlace[]) : [];
        setCache((prev) => ({ ...prev, [activeCategory]: list }));
      })
      .catch(() => setCache((prev) => ({ ...prev, [activeCategory]: [] })))
      .finally(() => setLoading(false));
  }, [activeCategory, lat, lng, cache]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [activeCategory]);

  const places = cache[activeCategory] ?? [];

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900">このスポットのまわりで</h3>
        <p className="text-[11px] text-gray-400">食べる・泊まる・立ち寄るスポット（Googleの口コミ付き）</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === cat.key
                ? "bg-navy text-white"
                : "border border-line bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className={activeCategory === cat.key ? "text-white" : cat.color}>
              {cat.icon}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton />
      ) : places.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-line bg-white">
          <p className="text-sm text-gray-400">周辺に該当する施設が見つかりません</p>
        </div>
      ) : (
        <div ref={scrollRef} className="flex flex-col gap-2">
          {places.map((place) => (
            <PlaceCard
              key={place.place_id}
              place={place}
              spotLat={lat}
              spotLng={lng}
              category={activeCategory}
            />
          ))}
        </div>
      )}

      <p className="mt-2 text-right text-[10px] text-gray-300">Powered by Google Places</p>
    </section>
  );
}
