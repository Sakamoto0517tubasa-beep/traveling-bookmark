"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Map as MapIcon,
  NotebookPen,
  Wallet,
  Ticket,
  Luggage,
  Share2,
  Users,
  Calendar,
  Trash2,
  Check,
  ExternalLink,
  Navigation,
  Globe,
  Heart,
} from "lucide-react";
import { hasSupabase } from "@/lib/supabase";
import {
  getTrip,
  updateTrip,
  listSpots,
  updateSpot,
  deleteSpot,
  listExpenses,
  addExpense,
  deleteExpense,
  listDays,
  upsertDay,
  listSchedule,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  listLinks,
  addLink,
  deleteLink,
  listTripPacking,
  addTripPacking,
  toggleTripPacking,
  deleteTripPacking,
} from "@/lib/db";
import type { Trip, Spot, Expense, DayPlan, ScheduleItem, LinkItem, TripPackingItem } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { toYen, formatYen, formatLocal } from "@/lib/currency";
import { countryCodeFromAddress, flagUrl } from "@/lib/countries";
import { countryInfo } from "@/lib/countryInfo";
import TripMap from "@/components/TripMap";
import AddSpotModal from "@/components/AddSpotModal";
import WeatherForecast from "@/components/WeatherForecast";
import CountdownTimer from "@/components/CountdownTimer";

type Tab = "map" | "plan" | "money" | "links" | "packing" | "info";

// スポットを順番に回る Google マップの経路URL（現在地は含めず、登録順）
function buildRouteUrl(spots: Spot[]): string | null {
  const pts = spots.filter((s) => s.lat != null && s.lng != null).slice(0, 10);
  if (pts.length === 0) return null;
  if (pts.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&destination=${pts[0].lat},${pts[0].lng}`;
  }
  const origin = `${pts[0].lat},${pts[0].lng}`;
  const destination = `${pts[pts.length - 1].lat},${pts[pts.length - 1].lng}`;
  const waypoints = pts
    .slice(1, -1)
    .map((s) => `${s.lat},${s.lng}`)
    .join("|");
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
  return url;
}

export default function TripPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm text-gray-400">読み込み中…</p>}>
      <TripView />
    </Suspense>
  );
}

function TripView() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tab, setTab] = useState<Tab>("map");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // 行きたい度（ハート）：連打に耐えるよう ref で集計し、DB保存はデバウンス
  const likeRef = useRef<Record<string, number>>({});
  const likeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function likeSpot(id: string) {
    const next = (likeRef.current[id] ?? 0) + 1;
    likeRef.current[id] = next;
    setSpots((prev) => prev.map((x) => (x.id === id ? { ...x, likes: next } : x)));
    clearTimeout(likeTimers.current[id]);
    likeTimers.current[id] = setTimeout(() => {
      updateSpot(id, { likes: next }).catch(() => {});
    }, 500);
  }

  const load = useCallback(async () => {
    if (!hasSupabase || !id) {
      setLoading(false);
      return;
    }
    const [t, s, e] = await Promise.all([getTrip(id), listSpots(id), listExpenses(id)]);
    setTrip(t);
    setSpots(s);
    likeRef.current = Object.fromEntries(s.map((sp) => [sp.id, sp.likes ?? 0]));
    setExpenses(e);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const totalYen = useMemo(() => {
    if (!trip) return 0;
    const local = spots.reduce((sum, s) => sum + (s.admission_fee || 0) + (s.hotel_fee || 0), 0);
    return toYen(local, trip.currency_rate);
  }, [spots, trip]);

  async function share() {
    const url = `${window.location.origin}/trip/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: trip?.name ?? "旅行", url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("共有リンクをコピーしました：\n" + url);
      }
    } catch {
      /* cancelled */
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-sm text-gray-400">読み込み中…</p>;
  }

  if (!hasSupabase) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-gray-500">
          Supabase の設定後に旅行を表示できます。<code>.env.local</code> を設定してください。
        </p>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-gray-500">旅行が見つかりませんでした。</p>
        <button onClick={() => router.push("/")} className="mt-3 text-sm font-bold text-brand">
          一覧に戻る
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-background pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 border-b border-line bg-navy px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="rounded p-1 hover:bg-white/10">
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
              {(trip.start_date || trip.end_date) && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {(trip.start_date ?? "").replaceAll("-", "/").slice(5)}
                  {trip.end_date ? `〜${trip.end_date.replaceAll("-", "/").slice(5)}` : ""}
                </span>
              )}
              {trip.members.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {trip.members.join("・")}
                </span>
              )}
            </div>
          </div>
          <button onClick={share} className="rounded p-2 hover:bg-white/10" title="共有">
            <Share2 className="size-5" />
          </button>
        </div>

        {/* 合計金額バー */}
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-white/10 px-3 py-2">
          <span className="text-xs text-white/70">旅行の合計（入場料＋ホテル）</span>
          <span className="tnum text-base font-bold">{formatYen(totalYen)}</span>
        </div>
      </header>

      {/* 出発カウントダウン（秒まで） */}
      <CountdownTimer start={trip.start_date} end={trip.end_date} />

      {/* タブ内容 */}
      {tab === "map" && (
        <>
          <TripMap
            spots={spots}
            height={320}
            onMarkerClick={(s) => router.push(`/trip/${id}/spot/${s.id}`)}
            tripId={id}
            onAddSpot={load}
          />
          {buildRouteUrl(spots) && (
            <div className="border-b border-line bg-white px-4 py-2.5">
              <a
                href={buildRouteUrl(spots)!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-md bg-navy py-2.5 text-sm font-bold text-white hover:opacity-90"
              >
                <Navigation className="size-4" />
                スポットを順に回るルートを見る
              </a>
              <p className="mt-1.5 text-center text-[11px] text-gray-400">
                Googleマップで登録順の経路を開きます（道案内・所要時間もそこで確認）
              </p>
            </div>
          )}
          <section className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-500">スポット（{spots.length}）</h2>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-dark"
              >
                <Plus className="size-4" />
                追加
              </button>
            </div>
            {spots.length > 0 && (
              <p className="mb-3 text-[11px] text-gray-400">
                ❤️ を押すほど上に！ふたりで「行きたい！」を連打してランキングにしよう
              </p>
            )}
            {spots.length === 0 ? (
              <div className="rounded-md border border-dashed border-line bg-white py-14 text-center">
                <p className="text-sm font-bold text-gray-600">まだスポットがありません</p>
                <p className="mt-1 text-xs text-gray-400">「追加」から場所を検索して登録しましょう</p>
              </div>
            ) : (
              <ul className="grid gap-2">
                {[...spots]
                  .sort(
                    (a, b) =>
                      (b.likes ?? 0) - (a.likes ?? 0) || a.order_index - b.order_index,
                  )
                  .map((s, i) => (
                    <SpotCard
                      key={s.id}
                      spot={s}
                      trip={trip}
                      rank={i + 1}
                      onLike={() => likeSpot(s.id)}
                      onClick={() => router.push(`/trip/${id}/spot/${s.id}`)}
                      onDelete={async () => {
                        if (!confirm(`「${s.name}」を削除しますか？`)) return;
                        await deleteSpot(s.id);
                        await load();
                      }}
                    />
                  ))}
              </ul>
            )}
          </section>
        </>
      )}

      {tab === "plan" && <PlanTab trip={trip} spots={spots} />}
      {tab === "money" && (
        <MoneyTab
          trip={trip}
          spots={spots}
          expenses={expenses}
          onAdd={async (inp) => {
            await addExpense(inp);
            await load();
          }}
          onDelete={async (eid) => {
            await deleteExpense(eid);
            await load();
          }}
          onSetBudget={async (yen) => {
            await updateTrip(trip.id, { budget: yen });
            await load();
          }}
        />
      )}
      {tab === "links" && <LinksTab trip={trip} />}
      {tab === "packing" && <PackingTab trip={trip} />}
      {tab === "info" && <CountryInfoTab spots={spots} />}

      {/* 下タブ */}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-2xl border-t border-line bg-white">
        {([
          { key: "map", label: "マップ", icon: MapIcon },
          { key: "plan", label: "しおり", icon: NotebookPen },
          { key: "money", label: "おかね", icon: Wallet },
          { key: "links", label: "予約", icon: Ticket },
          { key: "packing", label: "持ち物", icon: Luggage },
          { key: "info", label: "現地", icon: Globe },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${
              tab === t.key ? "text-brand" : "text-gray-400"
            }`}
          >
            <t.icon className="size-5" />
            {t.label}
          </button>
        ))}
      </nav>

      {showAdd && <AddSpotModal tripId={id} onClose={() => setShowAdd(false)} onAdded={load} />}
    </main>
  );
}

// ---- スポットカード ----
function SpotCard({
  spot,
  trip,
  rank,
  onClick,
  onDelete,
  onLike,
}: {
  spot: Spot;
  trip: Trip;
  rank: number;
  onClick: () => void;
  onDelete: () => void;
  onLike: () => void;
}) {
  const meta = CATEGORY_META[spot.category];
  const cost = (spot.admission_fee || 0) + (spot.hotel_fee || 0);
  const likes = spot.likes ?? 0;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-line bg-white p-2.5 text-left hover:bg-gray-50"
      >
        <div className="relative size-16 shrink-0">
          {spot.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spot.photo} alt="" className="size-16 rounded object-cover" />
          ) : (
            <div
              className="flex size-16 items-center justify-center rounded text-white"
              style={{ backgroundColor: meta.color }}
            >
              <MapIcon className="size-5" />
            </div>
          )}
          {/* 順位バッジ */}
          <span
            className={`absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white px-1 text-[11px] font-bold shadow ${
              medal ? "bg-white" : "bg-navy text-white"
            }`}
          >
            {medal ?? rank}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.label}
            </span>
            {spot.day != null && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                Day {spot.day}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-bold text-gray-900">{spot.name}</p>
          {spot.address && <p className="truncate text-[11px] text-gray-400">{spot.address}</p>}
          {cost > 0 && (
            <p className="tnum mt-0.5 text-[11px] text-gray-400">
              {formatLocal(cost, trip.currency_code)}（{formatYen(toYen(cost, trip.currency_rate))}）
            </p>
          )}
        </div>
        {/* 行きたい度（ハート・連打OK） */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-transform hover:bg-rose-50 active:scale-90"
          title="「行きたい！」を押す"
          aria-label="行きたい！"
        >
          <Heart className={`size-6 ${likes > 0 ? "fill-brand text-brand" : "text-gray-300"}`} />
          <span className="tnum text-[11px] font-bold text-gray-500">{likes}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 rounded-full p-2 text-gray-300 hover:bg-red-50 hover:text-brand"
          title="このスポットを削除"
          aria-label="このスポットを削除"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

// ---- しおり（日程表・タイムライン）----
const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

function PlanTab({ trip, spots }: { trip: Trip; spots: Spot[] }) {
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [d, s] = await Promise.all([listDays(trip.id), listSchedule(trip.id)]);
    setDayPlans(d);
    setItems(s);
    setLoading(false);
  }, [trip.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const days = useMemo(() => {
    let n = 3;
    if (trip.start_date && trip.end_date) {
      const s = new Date(trip.start_date);
      const e = new Date(trip.end_date);
      n = Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
    }
    const maxItemDay = items.reduce((m, it) => Math.max(m, it.day), 0);
    const maxSpotDay = spots.reduce((m, sp) => Math.max(m, sp.day ?? 0), 0);
    n = Math.max(n, maxItemDay, maxSpotDay, 1);
    return Array.from({ length: Math.min(n, 30) }, (_, i) => i + 1);
  }, [trip, items, spots]);

  function dateLabel(day: number): string | null {
    if (!trip.start_date) return null;
    const d = new Date(trip.start_date);
    d.setDate(d.getDate() + (day - 1));
    return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_JA[d.getDay()]}）`;
  }

  const titleFor = (day: number) => dayPlans.find((p) => p.day === day)?.title ?? "";

  async function saveTitle(day: number, title: string) {
    const saved = await upsertDay(trip.id, day, { title: title.trim() || null });
    setDayPlans((prev) => [...prev.filter((p) => p.day !== day), saved].sort((a, b) => a.day - b.day));
  }

  async function addItem(day: number, label: string, time: string | null) {
    const dayItems = items.filter((it) => it.day === day);
    const order = dayItems.length ? Math.max(...dayItems.map((it) => it.order_index)) + 1 : 0;
    const created = await addSchedule({ trip_id: trip.id, day, time, label, order_index: order });
    setItems((prev) => [...prev, created]);
  }

  async function patchItem(id: string, patch: { time?: string | null; label?: string }) {
    await updateSchedule(id, patch);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function removeItem(id: string) {
    await deleteSchedule(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  if (loading) return <p className="py-16 text-center text-sm text-gray-400">読み込み中…</p>;

  const firstSpot = spots.find((s) => s.lat != null && s.lng != null);

  return (
    <section className="space-y-5 p-4">
      <WeatherForecast lat={firstSpot?.lat ?? null} lng={firstSpot?.lng ?? null} />
      {days.map((d) => {
        const list = items.filter((it) => it.day === d).sort((a, b) => a.order_index - b.order_index);
        const dateStr = dateLabel(d);
        return (
          <div key={d} className="overflow-hidden rounded-md border border-line bg-white shadow-[0_1px_0_rgba(22,33,58,0.04)]">
            {/* 日付見出し */}
            <div className="flex items-stretch border-b border-line">
              <div className="flex w-14 shrink-0 flex-col items-center justify-center bg-navy py-2 leading-none text-white">
                <span className="text-xl font-bold">{d}</span>
                <span className="mt-0.5 text-[10px] font-bold text-white/70">日目</span>
              </div>
              <div className="min-w-0 flex-1 px-3 py-2">
                {dateStr && <span className="text-xs font-bold text-brand">{dateStr}</span>}
                <DayTitleInput key={`title-${d}`} initial={titleFor(d)} onSave={(v) => saveTitle(d, v)} />
              </div>
            </div>

            {/* タイムライン */}
            <div className="px-3 py-3">
              {list.length === 0 ? (
                <p className="py-2 text-center text-xs text-gray-400">まだ予定がありません。下から追加できます</p>
              ) : (
                <ul className="space-y-2">
                  {list.map((it) => (
                    <ScheduleRow key={it.id} item={it} onPatch={patchItem} onRemove={removeItem} />
                  ))}
                </ul>
              )}
              <ScheduleAdder day={d} spots={spots} onAdd={addItem} />
            </div>
          </div>
        );
      })}
      <p className="px-1 text-[11px] leading-relaxed text-gray-400">
        時間はそのまま文字で書けます（例:「9:30〜13:00」「18:30頃」）。入力した内容は自動で保存されます。
      </p>
    </section>
  );
}

function DayTitleInput({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== initial && onSave(v)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      placeholder="この日のテーマ（例: ルーヴル美術館・帰国）"
      className="mt-0.5 w-full border-none bg-transparent px-0 text-[15px] font-bold text-navy outline-none placeholder:text-[13px] placeholder:font-normal placeholder:text-gray-400"
    />
  );
}

function ScheduleRow({
  item,
  onPatch,
  onRemove,
}: {
  item: ScheduleItem;
  onPatch: (id: string, patch: { time?: string | null; label?: string }) => void;
  onRemove: (id: string) => void;
}) {
  const [time, setTime] = useState(item.time ?? "");
  const [label, setLabel] = useState(item.label);
  return (
    <li className="flex items-start gap-2">
      <span className="mt-3 size-1.5 shrink-0 rounded-full bg-brand" />
      <input
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onBlur={() => time !== (item.time ?? "") && onPatch(item.id, { time: time.trim() || null })}
        placeholder="時間"
        className="tnum w-24 shrink-0 rounded-md border border-line bg-gray-50 px-2 py-1.5 text-xs outline-none focus:border-brand"
      />
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label !== item.label && onPatch(item.id, { label: label.trim() || item.label })}
        placeholder="予定・やること"
        className="min-w-0 flex-1 rounded-md border border-line bg-gray-50 px-2 py-1.5 text-sm outline-none focus:border-brand"
      />
      <button
        onClick={() => onRemove(item.id)}
        className="mt-1.5 shrink-0 text-gray-300 hover:text-rose-500"
        title="削除"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

function ScheduleAdder({
  day,
  spots,
  onAdd,
}: {
  day: number;
  spots: Spot[];
  onAdd: (day: number, label: string, time: string | null) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        onClick={() => onAdd(day, "", null)}
        className="flex items-center gap-1 rounded border border-dashed border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-brand hover:text-brand"
      >
        <Plus className="size-3.5" />
        予定を追加
      </button>
      {spots.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onAdd(day, e.target.value, null);
              e.target.value = "";
            }
          }}
          className="rounded border border-line bg-white px-2 py-1.5 text-xs text-gray-600 outline-none"
        >
          <option value="">スポットから追加</option>
          {spots.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// ---- おかね（割り勘・精算）----
function MoneyTab({
  trip,
  spots,
  expenses,
  onAdd,
  onDelete,
  onSetBudget,
}: {
  trip: Trip;
  spots: Spot[];
  expenses: Expense[];
  onAdd: (inp: { trip_id: string; spot_id: string | null; payer: string; amount: number; label: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetBudget: (yen: number | null) => Promise<void>;
}) {
  const members = trip.members.length > 0 ? trip.members : ["自分", "相手"];
  const [payer, setPayer] = useState(members[0]);
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");

  const paidBy = useMemo(() => {
    const m: Record<string, number> = {};
    members.forEach((x) => (m[x] = 0));
    expenses.forEach((e) => {
      m[e.payer] = (m[e.payer] ?? 0) + e.amount;
    });
    return m;
  }, [expenses, members]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perHead = members.length > 0 ? total / members.length : 0;

  // 2人の精算（誰が誰にいくら）
  const settlement = useMemo(() => {
    const balances = members.map((name) => ({ name, bal: (paidBy[name] ?? 0) - perHead }));
    const debtors = balances.filter((b) => b.bal < -0.5).sort((a, b) => a.bal - b.bal);
    const creditors = balances.filter((b) => b.bal > 0.5).sort((a, b) => b.bal - a.bal);
    const res: { from: string; to: string; amount: number }[] = [];
    let i = 0,
      j = 0;
    const d = debtors.map((x) => ({ ...x }));
    const c = creditors.map((x) => ({ ...x }));
    while (i < d.length && j < c.length) {
      const pay = Math.min(-d[i].bal, c[j].bal);
      res.push({ from: d[i].name, to: c[j].name, amount: pay });
      d[i].bal += pay;
      c[j].bal -= pay;
      if (Math.abs(d[i].bal) < 0.5) i++;
      if (Math.abs(c[j].bal) < 0.5) j++;
    }
    return res;
  }, [members, paidBy, perHead]);

  async function submit() {
    const a = Number(amount);
    if (!a || a <= 0) {
      alert("金額を入れてください");
      return;
    }
    await onAdd({
      trip_id: trip.id,
      spot_id: null,
      payer,
      amount: a,
      label: label.trim() || null,
    });
    setAmount("");
    setLabel("");
  }

  const field = "rounded-md border border-line bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand";

  // 予算（円）に対する見込み合計 = スポットの予定費用＋おかねの支出（すべて円換算）
  const plannedLocal = spots.reduce((s, sp) => s + (sp.admission_fee || 0) + (sp.hotel_fee || 0), 0);
  const usedYen = toYen(plannedLocal, trip.currency_rate) + toYen(total, trip.currency_rate);

  return (
    <section className="space-y-5 p-4">
      {/* 予算管理 */}
      <BudgetCard budget={trip.budget} usedYen={usedYen} onSetBudget={onSetBudget} />

      {/* サマリー */}
      <div className="rounded-md border border-line bg-white p-4">
        <p className="text-xs font-bold text-gray-500">みんなで使った合計</p>
        <p className="tnum mt-1 text-2xl font-bold text-navy">
          {formatLocal(total, trip.currency_code)}
          <span className="ml-2 text-sm font-normal text-gray-400">
            （{formatYen(toYen(total, trip.currency_rate))}）
          </span>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {members.map((m) => (
            <div key={m} className="rounded-md bg-gray-50 p-2 text-center">
              <p className="truncate text-[11px] text-gray-500">{m} が立替</p>
              <p className="tnum text-sm font-bold text-gray-800">{formatLocal(paidBy[m] ?? 0, trip.currency_code)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 精算結果 */}
      {settlement.length > 0 && (
        <div className="rounded-md border border-brand/30 bg-rose-50 p-4">
          <p className="mb-2 text-xs font-bold text-brand">精算</p>
          <ul className="space-y-1.5">
            {settlement.map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-800">
                  {s.from} → {s.to}
                </span>
                <span className="tnum font-bold text-brand">
                  {formatLocal(Math.round(s.amount), trip.currency_code)}
                  <span className="ml-1 text-[11px] font-normal text-gray-400">
                    ({formatYen(toYen(s.amount, trip.currency_rate))})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 追加フォーム */}
      <div className="rounded-md border border-line bg-white p-4">
        <p className="mb-2 text-sm font-bold text-gray-700">支出を追加</p>
        <div className="grid grid-cols-2 gap-2">
          <select value={payer} onChange={(e) => setPayer(e.target.value)} className={field}>
            {members.map((m) => (
              <option key={m} value={m}>
                {m} が払った
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`金額（${trip.currency_code}）`}
            className={`${field} tnum`}
          />
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="項目（例: 夕食、入場料、タクシー）"
          className={`${field} mt-2 w-full`}
        />
        <button
          onClick={submit}
          className="mt-3 w-full rounded-md bg-navy py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          追加する
        </button>
      </div>

      {/* 明細 */}
      {expenses.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-gray-500">明細</p>
          <ul className="space-y-2">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-md border border-line bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-800">{e.label ?? "支出"}</p>
                  <p className="text-[11px] text-gray-400">{e.payer} が立替</p>
                </div>
                <span className="tnum text-sm font-bold text-gray-700">
                  {formatLocal(e.amount, trip.currency_code)}
                </span>
                <button onClick={() => onDelete(e.id)} className="text-[11px] text-gray-400 hover:text-rose-500">
                  削除
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="pt-1 text-center text-[11px] text-gray-400">
        {spots.length > 0 ? "" : "スポットを追加すると、入場料なども合計に反映できます"}
      </p>
    </section>
  );
}

// 予算カード（目標予算に対する見込み合計を可視化）
function BudgetCard({
  budget,
  usedYen,
  onSetBudget,
}: {
  budget: number | null;
  usedYen: number;
  onSetBudget: (yen: number | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(budget != null ? String(budget) : "");

  async function save() {
    const n = Number(input);
    await onSetBudget(n > 0 ? Math.round(n) : null);
    setEditing(false);
  }

  if (budget == null && !editing) {
    return (
      <div className="flex items-center justify-between rounded-md border border-dashed border-line bg-white px-4 py-3">
        <p className="text-sm font-bold text-gray-600">予算を決める 🎯</p>
        <button
          onClick={() => {
            setInput("");
            setEditing(true);
          }}
          className="rounded-md bg-navy px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
        >
          予算を設定
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-md border border-line bg-white p-4">
        <p className="mb-2 text-sm font-bold text-gray-700">目標予算（円）</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="例: 300000"
            className="tnum w-full rounded-md border border-line bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button onClick={save} className="shrink-0 rounded-md bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark">
            保存
          </button>
        </div>
        {budget != null && (
          <button
            onClick={async () => {
              await onSetBudget(null);
              setEditing(false);
            }}
            className="mt-2 text-[11px] text-gray-400 hover:text-rose-500"
          >
            予算を削除する
          </button>
        )}
      </div>
    );
  }

  const b = budget ?? 0;
  const pct = b > 0 ? Math.min((usedYen / b) * 100, 100) : 0;
  const over = usedYen > b;
  const remaining = b - usedYen;
  const barColor = over ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500">予算</p>
        <button onClick={() => { setInput(String(b)); setEditing(true); }} className="text-[11px] font-bold text-brand hover:underline">
          変更
        </button>
      </div>
      <div className="flex items-end justify-between">
        <p className="tnum text-2xl font-bold text-navy">{formatYen(usedYen)}</p>
        <p className="tnum text-sm text-gray-400">/ {formatYen(b)}</p>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-2 text-xs font-bold ${over ? "text-rose-500" : "text-gray-500"}`}>
        {over ? `予算オーバー ${formatYen(usedYen - b)}` : `残り ${formatYen(remaining)}`}
      </p>
      <p className="mt-1 text-[11px] text-gray-400">
        ※ スポットの予定費用（入場料・ホテル）＋おかねの支出の合計です
      </p>
    </div>
  );
}

// ---- 思い出 ----
// ---- リンク・予約 ----
function LinksTab({ trip }: { trip: Trip }) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const reload = useCallback(async () => {
    setLinks(await listLinks(trip.id));
    setLoading(false);
  }, [trip.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function submit() {
    if (!label.trim()) {
      alert("タイトルを入れてください（例: 航空券、ホテル）");
      return;
    }
    let u = url.trim();
    if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
    const created = await addLink({
      trip_id: trip.id,
      label: label.trim(),
      url: u || null,
      memo: null,
      order_index: links.length,
    });
    setLinks((prev) => [...prev, created]);
    setLabel("");
    setUrl("");
  }

  async function remove(id: string) {
    await deleteLink(id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  const field = "w-full rounded-md border border-line bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand";

  if (loading) return <p className="py-16 text-center text-sm text-gray-400">読み込み中…</p>;

  return (
    <section className="space-y-4 p-4">
      <div className="rounded-md border border-line bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-gray-700">予約を追加</h2>
        <div className="grid gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="タイトル（例: 航空券 ANA / ホテル予約）" className={field} />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="URL（任意・予約確認ページなど）"
            className={field}
          />
          <button onClick={submit} className="rounded-md bg-navy py-2.5 text-sm font-bold text-white hover:opacity-90">
            追加する
          </button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-white py-14 text-center">
          <Ticket className="mx-auto size-8 text-gray-300" />
          <p className="mt-3 text-sm font-bold text-gray-600">まだ予約がありません</p>
          <p className="mt-1 text-xs text-gray-400">航空券・ホテル・チケットの予約リンクをまとめておけます</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.id} className="flex items-center gap-2 rounded-md border border-line bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{l.label}</p>
                {l.url && <p className="truncate text-[11px] text-gray-400">{l.url}</p>}
              </div>
              {l.url && (
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-navy hover:bg-gray-50"
                >
                  <ExternalLink className="size-3.5" />
                  開く
                </a>
              )}
              <button onClick={() => remove(l.id)} className="shrink-0 text-gray-300 hover:text-rose-500" title="削除">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---- 持ち物（旅行全体）----
function PackingTab({ trip }: { trip: Trip }) {
  const [items, setItems] = useState<TripPackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");

  const reload = useCallback(async () => {
    setItems(await listTripPacking(trip.id));
    setLoading(false);
  }, [trip.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function add() {
    if (!newItem.trim()) return;
    const created = await addTripPacking(trip.id, newItem.trim(), items.length);
    setItems((prev) => [...prev, created]);
    setNewItem("");
  }

  async function toggle(it: TripPackingItem) {
    await toggleTripPacking(it.id, !it.checked);
    setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, checked: !x.checked } : x)));
  }

  async function remove(it: TripPackingItem) {
    await deleteTripPacking(it.id);
    setItems((prev) => prev.filter((x) => x.id !== it.id));
  }

  const field = "w-full rounded-md border border-line bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand";
  const done = items.filter((i) => i.checked).length;

  if (loading) return <p className="py-16 text-center text-sm text-gray-400">読み込み中…</p>;

  return (
    <section className="space-y-4 p-4">
      <div className="rounded-md border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">持ち物リスト（旅行全体）</h2>
          {items.length > 0 && (
            <span className="tnum text-xs font-bold text-gray-400">
              {done} / {items.length}
            </span>
          )}
        </div>
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            パスポート・充電器など、旅行全体の持ち物を下から追加できます
          </p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggle(it)}
                  className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                    it.checked ? "border-brand bg-brand text-white" : "border-gray-300 bg-white"
                  }`}
                >
                  {it.checked && <Check className="size-3.5" />}
                </button>
                <span className={`flex-1 text-sm ${it.checked ? "text-gray-400 line-through" : "text-gray-800"}`}>
                  {it.label}
                </span>
                <button onClick={() => remove(it)} className="text-gray-300 hover:text-rose-500">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="持ち物を追加（例: パスポート）"
            className={field}
          />
          <button onClick={add} className="shrink-0 rounded-md bg-navy px-3 text-white hover:opacity-90">
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ---- 現地（国の基本情報）----
function CountryInfoTab({ spots }: { spots: Spot[] }) {
  // スポットの住所から国コードを推定（最初に見つかったもの）
  let code: string | null = null;
  for (const s of spots) {
    code = countryCodeFromAddress(s.address);
    if (code) break;
  }
  const info = code ? countryInfo(code) : null;

  if (!code) {
    return (
      <section className="p-4">
        <div className="rounded-md border border-dashed border-line bg-white py-14 text-center">
          <Globe className="mx-auto mb-2 size-6 text-gray-300" />
          <p className="text-sm font-bold text-gray-600">まだ行き先がわかりません</p>
          <p className="mt-1 text-xs text-gray-400">
            マップでスポットを登録すると、その国の基本情報が出ます
          </p>
        </div>
      </section>
    );
  }

  const rows: { emoji: string; label: string; value: string }[] = info
    ? [
        { emoji: "💶", label: "通貨", value: info.currency },
        { emoji: "🔌", label: "電圧・プラグ", value: info.plug },
        { emoji: "💁", label: "チップ", value: info.tipping },
        { emoji: "🚨", label: "緊急番号", value: info.emergency },
        { emoji: "🚰", label: "水道水", value: info.water },
        { emoji: "🕐", label: "日本との時差", value: info.timeDiff },
        { emoji: "🛂", label: "ビザ（観光）", value: info.visa },
        { emoji: "💡", label: "ひとことメモ", value: info.tips },
      ]
    : [];

  return (
    <section className="space-y-4 p-4">
      {/* 国ヘッダー */}
      <div className="flex items-center gap-3 rounded-md border border-line bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl(code)}
          alt=""
          className="h-9 w-14 shrink-0 rounded border border-line object-cover"
        />
        <div>
          <p className="text-[11px] font-bold text-gray-400">旅行先の基本情報</p>
          <h2 className="text-lg font-bold text-gray-900">
            {info ? info.name : code.toUpperCase()}
          </h2>
        </div>
      </div>

      {info ? (
        <>
          <div className="overflow-hidden rounded-md border border-line bg-white">
            {rows.map((r, i) => (
              <div
                key={r.label}
                className={`flex gap-3 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
              >
                <span className="shrink-0 text-lg leading-6">{r.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-400">{r.label}</p>
                  <p className="text-sm leading-relaxed text-gray-800">{r.value}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="px-1 text-[11px] leading-relaxed text-gray-400">
            ※ 情報は目安です。ビザ・治安・入国ルールは変わることがあるので、渡航前に外務省
            「海外安全ホームページ」などで最新情報を確認してください。
          </p>
        </>
      ) : (
        <div className="rounded-md border border-dashed border-line bg-white py-10 text-center">
          <p className="text-sm font-bold text-gray-600">この国の詳細情報は準備中です</p>
          <p className="mt-1 text-xs text-gray-400">
            通貨・チップ・電源などは渡航前に確認してください
          </p>
        </div>
      )}
    </section>
  );
}
