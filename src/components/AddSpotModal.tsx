"use client";

import { useState } from "react";
import { Search, X, Star, MapPin } from "lucide-react";
import type { PlaceResult } from "@/app/api/search-place/route";
import { CATEGORY_META, type SpotCategory } from "@/lib/types";
import { createSpot } from "@/lib/db";

const CATS: SpotCategory[] = ["sightseeing", "food", "cafe", "lodging", "shopping", "other"];

// Google の place types からカテゴリを推測
function guessCategory(types: string[]): SpotCategory {
  if (types.includes("lodging")) return "lodging";
  if (types.includes("cafe")) return "cafe";
  if (types.includes("restaurant") || types.includes("food")) return "food";
  if (types.includes("store") || types.includes("shopping_mall")) return "shopping";
  return "sightseeing";
}

export default function AddSpotModal({
  tripId,
  onClose,
  onAdded,
}: {
  tripId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function search() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search-place?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as PlaceResult[];
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function pick(p: PlaceResult) {
    setSaving(p.place_id);
    try {
      await createSpot({
        trip_id: tripId,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        address: p.address,
        category: guessCategory(p.types),
        photo: p.photo_ref ? `/api/place-photo?ref=${encodeURIComponent(p.photo_ref)}` : null,
        place_id: p.place_id,
      });
      onAdded();
      onClose();
    } catch (e) {
      alert("追加に失敗しました: " + (e as Error).message);
      setSaving(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-md bg-white sm:rounded-md">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-base font-bold">スポットを追加</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="size-5" />
          </button>
        </div>

        {/* 検索欄 */}
        <div className="border-b border-line p-4">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-line bg-gray-50 px-3">
              <Search className="size-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="場所名で検索（例: ドレスデン 聖母教会）"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={search}
              className="shrink-0 rounded-md bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark"
            >
              検索
            </button>
          </div>
        </div>

        {/* 結果 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">検索中…</p>
          ) : results == null ? (
            <p className="py-8 text-center text-sm text-gray-400">
              行きたい場所の名前を入れて検索してください
            </p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">見つかりませんでした</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((p) => (
                <li key={p.place_id}>
                  <button
                    onClick={() => pick(p)}
                    disabled={saving != null}
                    className="flex w-full items-center gap-3 rounded-md border border-line bg-white p-2 text-left hover:bg-gray-50 disabled:opacity-50"
                  >
                    {p.photo_ref ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/place-photo?ref=${encodeURIComponent(p.photo_ref)}`}
                        alt={p.name}
                        className="size-14 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded bg-gray-100">
                        <MapPin className="size-5 text-gray-300" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{p.name}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: CATEGORY_META[guessCategory(p.types)].color }}
                        >
                          {CATEGORY_META[guessCategory(p.types)].label}
                        </span>
                        {p.rating != null && (
                          <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            {p.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-gray-400">{p.address}</p>
                    </div>
                    {saving === p.place_id && (
                      <span className="shrink-0 text-xs text-gray-400">追加中…</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export { CATS };
