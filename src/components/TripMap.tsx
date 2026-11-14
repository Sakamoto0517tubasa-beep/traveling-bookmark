"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import type { Spot, SpotCategory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { createSpot } from "@/lib/db";
import type { NearbyPlace } from "@/app/api/nearby/route";
import type { PlaceDetails } from "@/app/api/place-details/route";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// 発見タブの分類（観光施設の種類）。spotCat は追加時に保存するカテゴリ
type DiscoverCat = { key: string; label: string; color: string; spotCat: SpotCategory };
const DISCOVER_CATS: DiscoverCat[] = [
  { key: "history", label: "歴史・文化", color: "#7C3AED", spotCat: "sightseeing" },
  { key: "nature", label: "自然", color: "#059669", spotCat: "sightseeing" },
  { key: "leisure", label: "レジャー", color: "#DB2777", spotCat: "sightseeing" },
  { key: "experience", label: "体験", color: "#D97706", spotCat: "sightseeing" },
  { key: "shopping", label: "買い物", color: "#0891B2", spotCat: "shopping" },
  { key: "onsen", label: "温泉・リゾート", color: "#E11D48", spotCat: "lodging" },
  { key: "entertainment", label: "エンタメ", color: "#9333EA", spotCat: "other" },
  { key: "sports", label: "スポーツ", color: "#2563EB", spotCat: "other" },
  { key: "food", label: "グルメ", color: "#EA580C", spotCat: "food" },
  { key: "landmark", label: "ランドマーク", color: "#0D9488", spotCat: "sightseeing" },
];

// 発見結果の簡易キャッシュ（カテゴリ＋おおよその中心＋ズームごと）。再表示を即時に。
// ※この TripMap は "Map" を地図コンポーネントとして import しているため、
//   組み込みの Map ではなくプレーンオブジェクトで持つ。
const discoverCache: Record<string, NearbyPlace[]> = {};

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function FitBounds({ spots, active }: { spots: Spot[]; active: boolean }) {
  const map = useMap();
  const pts = useMemo(() => spots.filter((s) => s.lat != null && s.lng != null), [spots]);

  useEffect(() => {
    if (!map || !active || pts.length === 0) return;
    if (pts.length === 1) {
      map.setCenter({ lat: pts[0].lat!, lng: pts[0].lng! });
      map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    pts.forEach((s) => bounds.extend({ lat: s.lat!, lng: s.lng! }));
    map.fitBounds(bounds, 60);
  }, [map, pts, active]);

  return null;
}

function circleIcon(color: string, scale: number, opacity: number): google.maps.Symbol | undefined {
  if (typeof google === "undefined" || !google.maps) return undefined;
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: opacity,
    strokeColor: "#ffffff",
    strokeWeight: scale > 7 ? 2 : 1.5,
    scale,
  };
}

// 自分の登録スポット
function SavedMarkers({
  spots,
  onMarkerClick,
}: {
  spots: Spot[];
  onMarkerClick?: (spot: Spot) => void;
}) {
  const mapsLib = useMapsLibrary("maps");
  if (!mapsLib) return null;
  const withCoords = spots.filter((s) => s.lat != null && s.lng != null);
  return (
    <>
      {withCoords.map((s) => (
        <Marker
          key={s.id}
          position={{ lat: s.lat!, lng: s.lng! }}
          title={s.name}
          icon={circleIcon(CATEGORY_META[s.category]?.pin ?? "#6B7280", 8, 1)}
          onClick={() => onMarkerClick?.(s)}
          zIndex={1000}
        />
      ))}
    </>
  );
}

// 発見：地図で見ているエリアの観光施設を分類別に表示
function Discovery({
  categoryKey,
  color,
  spotCategory,
  tripId,
  onAddSpot,
  onLoadingChange,
}: {
  categoryKey: string;
  color: string;
  spotCategory: SpotCategory;
  tripId: string;
  onAddSpot?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [selected, setSelected] = useState<NearbyPlace | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ピンを選んだら、その場所の解説（Google の概要）を取得
  useEffect(() => {
    if (!selected) {
      setDetails(null);
      return;
    }
    let active = true;
    setDetails(null);
    setDetailsLoading(true);
    fetch(`/api/place-details?place_id=${encodeURIComponent(selected.place_id)}`)
      .then((r) => r.json())
      .then((d: PlaceDetails | null) => {
        if (active) setDetails(d);
      })
      .catch(() => {
        if (active) setDetails(null);
      })
      .finally(() => {
        if (active) setDetailsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected]);

  useEffect(() => {
    if (!map) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const c = map.getCenter();
        const b = map.getBounds();
        if (!c || !b) return;
        const ne = b.getNorthEast();
        const radius = Math.min(
          50000,
          Math.round(distanceMeters(c.lat(), c.lng(), ne.lat(), ne.lng())),
        );
        // キャッシュがあれば即表示（通信なし）
        const key = `${categoryKey}|${c.lat().toFixed(2)}|${c.lng().toFixed(2)}|${Math.round(map.getZoom() ?? 0)}`;
        const cached = discoverCache[key];
        if (cached) {
          if (active) setPlaces(cached);
          return;
        }
        onLoadingChange?.(true);
        try {
          const res = await fetch(
            `/api/discover?lat=${c.lat()}&lng=${c.lng()}&radius=${radius}&category=${categoryKey}`,
          );
          const data = (await res.json()) as NearbyPlace[];
          const list = Array.isArray(data) ? data : [];
          discoverCache[key] = list;
          if (active) setPlaces(list);
        } catch {
          if (active) setPlaces([]);
        } finally {
          if (active) onLoadingChange?.(false);
        }
      }, 200);
    };
    run();
    const listener = map.addListener("idle", run);
    return () => {
      active = false;
      clearTimeout(timer);
      listener.remove();
      onLoadingChange?.(false);
    };
  }, [map, categoryKey, onLoadingChange]);

  async function add(p: NearbyPlace) {
    setSaving(true);
    try {
      await createSpot({
        trip_id: tripId,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        address: p.vicinity || null,
        category: spotCategory,
        photo: p.photo_ref ? `/api/place-photo?ref=${encodeURIComponent(p.photo_ref)}` : null,
        place_id: p.place_id,
      });
      setAdded((prev) => new Set(prev).add(p.place_id));
      onAddSpot?.();
    } catch (e) {
      alert("追加に失敗しました: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!mapsLib) return null;
  return (
    <>
      {places.map((p) => (
        <Marker
          key={p.place_id}
          position={{ lat: p.lat, lng: p.lng }}
          title={p.name}
          icon={circleIcon(color, added.has(p.place_id) ? 7 : 6, added.has(p.place_id) ? 1 : 0.85)}
          onClick={() => setSelected(p)}
        />
      ))}
      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ maxWidth: 220, fontFamily: "sans-serif" }}>
            <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: "#17171d" }}>
              {selected.name}
            </p>
            {selected.rating != null && (
              <p style={{ fontSize: 12, color: "#555", margin: "2px 0 0" }}>
                ★ {selected.rating.toFixed(1)}（{selected.user_ratings_total}件）
              </p>
            )}
            {selected.vicinity && (
              <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>{selected.vicinity}</p>
            )}
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#444",
                lineHeight: 1.6,
                maxHeight: 132,
                overflowY: "auto",
              }}
            >
              {detailsLoading
                ? "解説を読み込み中…"
                : details?.editorial_summary
                  ? details.editorial_summary
                  : "この場所の解説は見つかりませんでした。"}
            </div>
            {details?.maps_url && (
              <a
                href={details.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: 4, fontSize: 11, color: "#2563eb" }}
              >
                Googleマップで詳しく見る
              </a>
            )}
            {added.has(selected.place_id) ? (
              <p style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#059669" }}>
                追加しました ✓
              </p>
            ) : (
              <button
                onClick={() => add(selected)}
                disabled={saving}
                style={{
                  marginTop: 8,
                  background: "#16213a",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                このスポットを追加
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function TripMap({
  spots,
  height = 280,
  onMarkerClick,
  tripId,
  onAddSpot,
}: {
  spots: Spot[];
  height?: number;
  onMarkerClick?: (spot: Spot) => void;
  tripId?: string;
  onAddSpot?: () => void;
}) {
  const [catKey, setCatKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const activeCat = DISCOVER_CATS.find((c) => c.key === catKey) ?? null;

  if (!KEY) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center border-y border-line bg-white text-center text-sm text-gray-400"
      >
        地図を表示するには Google Maps キーの設定が必要です
      </div>
    );
  }

  const withCoords = spots.filter((s) => s.lat != null && s.lng != null);
  const center =
    withCoords.length > 0
      ? { lat: withCoords[0].lat!, lng: withCoords[0].lng! }
      : { lat: 35.681236, lng: 139.767125 }; // 東京駅

  const canDiscover = !!tripId;

  return (
    <div style={{ height }} className="relative w-full overflow-hidden">
      {/* 種類タブ（発見） */}
      {canDiscover && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-10 px-2">
          <div className="pointer-events-auto flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setCatKey(null)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold shadow-sm ${
                catKey === null ? "bg-navy text-white" : "bg-white/95 text-gray-600"
              }`}
            >
              マイスポット
            </button>
            {DISCOVER_CATS.map((c) => (
              <button
                key={c.key}
                onClick={() => setCatKey(c.key)}
                className="shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-bold shadow-sm"
                style={
                  catKey === c.key
                    ? { backgroundColor: c.color, color: "#fff" }
                    : { background: "rgba(255,255,255,0.95)", color: "#4b5563" }
                }
              >
                {c.label}
              </button>
            ))}
          </div>
          {catKey !== null && (
            <div className="pointer-events-none mt-1 flex justify-center">
              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {loading ? "この辺りの観光地を検索中…" : "地図を動かすとそのエリアで探せます・ピンをタップで追加"}
              </span>
            </div>
          )}
        </div>
      )}

      <APIProvider apiKey={KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={withCoords.length > 0 ? 13 : 4}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          clickableIcons={false}
          style={{ width: "100%", height: "100%" }}
        >
          <SavedMarkers spots={spots} onMarkerClick={onMarkerClick} />
          <FitBounds spots={spots} active={catKey === null} />
          {canDiscover && activeCat && (
            <Discovery
              key={activeCat.key}
              categoryKey={activeCat.key}
              color={activeCat.color}
              spotCategory={activeCat.spotCat}
              tripId={tripId!}
              onAddSpot={onAddSpot}
              onLoadingChange={setLoading}
            />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
