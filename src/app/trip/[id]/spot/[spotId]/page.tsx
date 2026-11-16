"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus, Trash2, Star, Navigation, BookOpen, Clock, ExternalLink } from "lucide-react";
import type { PlaceDetails } from "@/app/api/place-details/route";
import { hasSupabase } from "@/lib/supabase";
import {
  getSpot,
  getTrip,
  updateSpot,
  deleteSpot,
  listPacking,
  addPacking,
  togglePacking,
  deletePacking,
} from "@/lib/db";
import type { Spot, Trip, PackingItem, SpotCategory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { formatYen, toYen } from "@/lib/currency";
import NearbyPlaces from "@/components/NearbyPlaces";
import WeatherForecast from "@/components/WeatherForecast";

const CATS: SpotCategory[] = ["sightseeing", "food", "cafe", "lodging", "shopping", "other"];

export default function SpotPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm text-gray-400">読み込み中…</p>}>
      <SpotView />
    </Suspense>
  );
}

function SpotView() {
  const router = useRouter();
  const { id, spotId } = useParams<{ id: string; spotId: string }>();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [packing, setPacking] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // 編集用ローカル状態
  const [category, setCategory] = useState<SpotCategory>("sightseeing");
  const [fee, setFee] = useState("0");
  const [hotel, setHotel] = useState("");
  const [hotelFee, setHotelFee] = useState("0");
  const [hours, setHours] = useState("");
  const [visited, setVisited] = useState(false);
  const [memo, setMemo] = useState("");
  const [memoPhoto, setMemoPhoto] = useState("");
  const [newItem, setNewItem] = useState("");

  const load = useCallback(async () => {
    if (!hasSupabase || !spotId) {
      setLoading(false);
      return;
    }
    const [sp, tp, pk] = await Promise.all([getSpot(spotId), getTrip(id), listPacking(spotId)]);
    if (sp) {
      setSpot(sp);
      setCategory(sp.category);
      setFee(String(sp.admission_fee ?? 0));
      setHotel(sp.hotel_name ?? "");
      setHotelFee(String(sp.hotel_fee ?? 0));
      setHours(sp.hours_memo ?? "");
      setVisited(sp.visited);
      setMemo(sp.memory_note ?? "");
      setMemoPhoto(sp.memory_photo ?? "");
    }
    setTrip(tp);
    setPacking(pk);
    setLoading(false);
  }, [id, spotId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!spot) return;
    await updateSpot(spot.id, {
      category,
      admission_fee: Number(fee) || 0,
      hotel_name: hotel.trim() || null,
      hotel_fee: Number(hotelFee) || 0,
      hours_memo: hours.trim() || null,
      visited,
      memory_note: memo.trim() || null,
      memory_photo: memoPhoto.trim() || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function removeSpot() {
    if (!spot) return;
    if (!confirm("このスポットを削除しますか？")) return;
    await deleteSpot(spot.id);
    router.push(`/trip/${id}`);
  }

  async function addItem() {
    if (!newItem.trim() || !spot) return;
    await addPacking(spot.id, newItem.trim());
    setNewItem("");
    setPacking(await listPacking(spot.id));
  }

  async function toggleItem(it: PackingItem) {
    await togglePacking(it.id, !it.checked);
    setPacking((prev) => prev.map((x) => (x.id === it.id ? { ...x, checked: !x.checked } : x)));
  }

  async function removeItem(it: PackingItem) {
    await deletePacking(it.id);
    setPacking((prev) => prev.filter((x) => x.id !== it.id));
  }

  if (loading) return <p className="py-20 text-center text-sm text-gray-400">読み込み中…</p>;
  if (!spot || !trip)
    return (
      <main className="p-6 text-center">
        <p className="text-sm text-gray-500">スポットが見つかりませんでした。</p>
      </main>
    );

  const meta = CATEGORY_META[category];
  const field = "w-full rounded-md border border-line bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand";
  const labelCls = "mb-1 block text-xs font-bold text-gray-500";

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-background pb-28">
      {/* ヘッダー画像 */}
      <div className="relative h-44 bg-navy">
        {spot.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={spot.photo} alt="" decoding="async" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center" style={{ backgroundColor: meta.color }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => router.push(`/trip/${id}`)}
          className="absolute left-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <span
            className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </span>
          <h1 className="mt-1 text-lg font-bold leading-tight drop-shadow">{spot.name}</h1>
          {spot.address && <p className="truncate text-[11px] text-white/80">{spot.address}</p>}
        </div>
      </div>

      <div className="space-y-5 p-4">
        {/* 道案内 */}
        {spot.lat != null && spot.lng != null && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-md bg-navy py-3 text-sm font-bold text-white hover:opacity-90"
          >
            <Navigation className="size-4" />
            ここへの道案内（Googleマップ）
          </a>
        )}

        {/* このスポットについて（解説） */}
        <PlaceAbout placeId={spot.place_id} name={spot.name} />

        {/* この場所の週間天気（今日から1週間） */}
        {spot.lat != null && spot.lng != null && (
          <WeatherForecast lat={spot.lat} lng={spot.lng} title="ここの天気（今日から1週間）" />
        )}

        {/* 基本情報 */}
        <section className="rounded-md border border-line bg-white p-4">
          <div className="grid gap-3">
            <div>
              <label className={labelCls}>カテゴリ</label>
              <div className="flex flex-wrap gap-1.5">
                {CATS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="rounded border px-3 py-1.5 text-xs font-bold"
                    style={
                      category === c
                        ? { backgroundColor: CATEGORY_META[c].color, color: "#fff", borderColor: CATEGORY_META[c].color }
                        : { background: "#fff", color: "#6b7280", borderColor: "#d7dbe3" }
                    }
                  >
                    {CATEGORY_META[c].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>入場料（{trip.currency_code}）</label>
                <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className={`${field} tnum`} />
              </div>
              <div>
                <label className={labelCls}>ホテル代（{trip.currency_code}）</label>
                <input
                  type="number"
                  value={hotelFee}
                  onChange={(e) => setHotelFee(e.target.value)}
                  className={`${field} tnum`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>ホテル名</label>
              <input value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder="泊まるホテル名" className={field} />
            </div>

            <div>
              <label className={labelCls}>営業時間・メモ</label>
              <textarea
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                rows={2}
                placeholder="営業時間、予約状況、行きたい理由など"
                className={field}
              />
            </div>

            {(Number(fee) > 0 || Number(hotelFee) > 0) && (
              <p className="text-right text-xs text-gray-400">
                合計 {formatYen(toYen((Number(fee) || 0) + (Number(hotelFee) || 0), trip.currency_rate))}
              </p>
            )}
          </div>
        </section>

        {/* 持ち物リスト */}
        <section className="rounded-md border border-line bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-gray-700">持ち物リスト</h2>
          <ul className="space-y-1.5">
            {packing.map((it) => (
              <li key={it.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleItem(it)}
                  className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                    it.checked ? "border-brand bg-brand text-white" : "border-gray-300 bg-white"
                  }`}
                >
                  {it.checked && <Check className="size-3.5" />}
                </button>
                <span className={`flex-1 text-sm ${it.checked ? "text-gray-400 line-through" : "text-gray-800"}`}>
                  {it.label}
                </span>
                <button onClick={() => removeItem(it)} className="text-gray-300 hover:text-rose-500">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="持ち物を追加（例: パスポート）"
              className={field}
            />
            <button onClick={addItem} className="shrink-0 rounded-md bg-navy px-3 text-white hover:opacity-90">
              <Plus className="size-5" />
            </button>
          </div>
        </section>

        {/* 思い出 */}
        <section className="rounded-md border border-line bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">思い出</h2>
            <button
              onClick={() => setVisited((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                visited ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              <Star className={`size-3.5 ${visited ? "fill-emerald-500 text-emerald-500" : ""}`} />
              {visited ? "行った！" : "行ったら押す"}
            </button>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="ひとこと思い出を残そう"
            className={field}
          />
          <input
            value={memoPhoto}
            onChange={(e) => setMemoPhoto(e.target.value)}
            placeholder="思い出の写真URL（任意）"
            className={`${field} mt-2`}
          />
        </section>

        {/* 保存 */}
        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex-1 rounded-md bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark"
          >
            {saved ? "保存しました ✓" : "変更を保存"}
          </button>
          <button
            onClick={removeSpot}
            className="rounded-md border border-line bg-white px-4 text-sm font-bold text-gray-500 hover:text-rose-500"
          >
            削除
          </button>
        </div>

        {/* このスポットのまわりで */}
        {spot.lat != null && spot.lng != null && (
          <div className="pt-2">
            <NearbyPlaces lat={spot.lat} lng={spot.lng} />
          </div>
        )}
      </div>
    </main>
  );
}

// このスポットについて（Googleの概要・営業時間・リンク）
function PlaceAbout({ placeId, name }: { placeId: string | null; name: string }) {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const param = placeId
      ? `place_id=${encodeURIComponent(placeId)}`
      : `q=${encodeURIComponent(name)}`;
    fetch(`/api/place-details?${param}`)
      .then((r) => r.json())
      .then((d: PlaceDetails | null) => {
        if (active) setDetails(d);
      })
      .catch(() => {
        if (active) setDetails(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [placeId, name]);

  const hasContent =
    details && (details.editorial_summary || details.weekday_text.length > 0 || details.website);

  return (
    <section className="rounded-md border border-line bg-white p-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700">
        <BookOpen className="size-4 text-brand" />
        このスポットについて
      </h2>

      {loading ? (
        <p className="py-3 text-center text-xs text-gray-400">解説を読み込み中…</p>
      ) : !hasContent ? (
        <p className="py-2 text-xs text-gray-400">
          この場所の解説は見つかりませんでした。
        </p>
      ) : (
        <div className="space-y-3">
          {details!.editorial_summary && (
            <p className="text-sm leading-relaxed text-gray-700">{details!.editorial_summary}</p>
          )}

          {(details!.rating != null || details!.phone) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {details!.rating != null && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {details!.rating.toFixed(1)}（{details!.user_ratings_total}件）
                </span>
              )}
              {details!.phone && <span>{details!.phone}</span>}
            </div>
          )}

          {details!.weekday_text.length > 0 && (
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-500">
                <Clock className="size-3.5" />
                営業時間
              </p>
              <ul className="space-y-0.5 text-[11px] text-gray-500">
                {details!.weekday_text.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1 text-xs font-bold">
            {details!.website && (
              <a
                href={details!.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-brand hover:underline"
              >
                <ExternalLink className="size-3.5" />
                公式サイト
              </a>
            )}
            {details!.maps_url && (
              <a
                href={details!.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-navy hover:underline"
              >
                <ExternalLink className="size-3.5" />
                Googleマップで見る
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
