"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Users, Calendar, Trash2 } from "lucide-react";
import { hasSupabase } from "@/lib/supabase";
import { listTrips, deleteTrip, getTripCountryCodes } from "@/lib/db";
import { flagUrl } from "@/lib/countries";
import { tripCountdown } from "@/lib/date";
import type { Trip } from "@/lib/types";
import CreateTripModal from "@/components/CreateTripModal";

function fmtRange(s: string | null, e: string | null): string {
  if (!s && !e) return "日程未定";
  const f = (d: string) => d.replaceAll("-", "/").slice(5);
  if (s && e) return `${f(s)} 〜 ${f(e)}`;
  return f((s || e)!);
}

export default function Home() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!hasSupabase) {
      setTrips([]);
      return;
    }
    try {
      const list = await listTrips();
      setTrips(list);
      try {
        setCountries(await getTripCountryCodes(list.map((t) => t.id)));
      } catch {
        /* 国旗が取れなくても一覧は表示する */
      }
    } catch (e) {
      setError((e as Error).message);
      setTrips([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeTrip(t: Trip) {
    if (
      !confirm(
        `「${t.name}」を削除しますか？\nこの旅行のスポット・しおり・持ち物・お土産なども全て消えます。元に戻せません。`,
      )
    )
      return;
    try {
      await deleteTrip(t.id);
      setTrips((prev) => (prev ? prev.filter((x) => x.id !== t.id) : prev));
    } catch (e) {
      alert("削除に失敗しました：" + (e as Error).message);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-background pb-28">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-line bg-navy px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-brand" />
          <h1 className="text-lg font-bold tracking-tight">KOR</h1>
        </div>
        <p className="mt-0.5 text-xs text-white/60">ふたりの旅のしおり</p>
      </header>

      {/* セットアップ案内 */}
      {!hasSupabase && (
        <div className="m-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-bold">はじめに設定が必要です</p>
          <p className="mt-1 text-[13px]">
            Google Maps キーと Supabase の接続情報を <code>.env.local</code> に設定すると、
            地図・検索・保存が使えるようになります。
          </p>
        </div>
      )}

      {error && (
        <div className="m-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          データの読み込みに失敗しました：{error}
        </div>
      )}

      {/* 一覧 */}
      <section className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-500">あなたの旅行</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            <Plus className="size-4" />
            新しい旅行
          </button>
        </div>

        {trips == null ? (
          <p className="py-16 text-center text-sm text-gray-400">読み込み中…</p>
        ) : trips.length === 0 ? (
          <div className="rounded-md border border-dashed border-line bg-white py-16 text-center">
            <MapPin className="mx-auto size-8 text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-600">まだ旅行がありません</p>
            <p className="mt-1 text-xs text-gray-400">
              「新しい旅行」から、ふたりの旅を作りましょう
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {trips.map((t) => (
              <li key={t.id} className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/trip/${t.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/trip/${t.id}`)}
                  className="w-full cursor-pointer overflow-hidden rounded-md border border-line bg-white text-left transition-shadow hover:shadow-sm"
                >
                  <div className="relative h-28 bg-navy">
                    {t.cover_photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.cover_photo} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                    ) : countries[t.id] ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={flagUrl(countries[t.id])}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/15" />
                      </>
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-navy to-brand/70">
                        <MapPin className="size-7 text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900">{t.name}</p>
                      {(() => {
                        const cd = tripCountdown(t.start_date, t.end_date);
                        return cd ? (
                          <span
                            className={`tnum shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              cd.soon ? "bg-brand text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {cd.text}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {fmtRange(t.start_date, t.end_date)}
                      </span>
                      {t.members.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {t.members.join("・")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrip(t);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-rose-500"
                  title="この旅行を削除"
                  aria-label={`${t.name}を削除`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showCreate && (
        <CreateTripModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => router.push(`/trip/${id}`)}
        />
      )}
    </main>
  );
}
