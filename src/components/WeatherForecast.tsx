"use client";

import { useEffect, useState } from "react";
import { CloudSun } from "lucide-react";
import { ymd, WEEKDAY_JA } from "@/lib/date";

type DayWeather = { date: string; code: number; tmax: number; tmin: number; pop: number };
type Status = "loading" | "ok" | "out" | "none";

// WMO weather code → 絵文字＋ラベル
function weatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "☀️", label: "快晴" };
  if (code <= 2) return { emoji: "🌤️", label: "晴れ" };
  if (code === 3) return { emoji: "☁️", label: "曇り" };
  if (code === 45 || code === 48) return { emoji: "🌫️", label: "霧" };
  if (code >= 51 && code <= 57) return { emoji: "🌦️", label: "霧雨" };
  if (code >= 61 && code <= 67) return { emoji: "🌧️", label: "雨" };
  if (code >= 71 && code <= 77) return { emoji: "🌨️", label: "雪" };
  if (code >= 80 && code <= 82) return { emoji: "🌦️", label: "にわか雨" };
  if (code >= 85 && code <= 86) return { emoji: "🌨️", label: "にわか雪" };
  if (code >= 95) return { emoji: "⛈️", label: "雷雨" };
  return { emoji: "🌡️", label: "—" };
}

export default function WeatherForecast({
  lat,
  lng,
  start,
  end,
}: {
  lat: number | null;
  lng: number | null;
  start: string | null;
  end: string | null;
}) {
  const [days, setDays] = useState<DayWeather[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    if (lat == null || lng == null) {
      setStatus("none");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 15); // Open-Meteo の無料予報は約16日先まで

    if (!start) {
      setStatus("none");
      return;
    }
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = end ? new Date(end) : s;
    e.setHours(0, 0, 0, 0);
    if (e.getTime() < today.getTime() || s.getTime() > maxDate.getTime()) {
      setStatus("out");
      return;
    }
    const rs = s.getTime() < today.getTime() ? today : s;
    const re = e.getTime() > maxDate.getTime() ? maxDate : e;

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=auto&start_date=${ymd(rs)}&end_date=${ymd(re)}`;

    setStatus("loading");
    fetch(url)
      .then((r) => r.json())
      .then((d: { daily?: Record<string, (number | string)[]> }) => {
        if (!active) return;
        const t = d.daily;
        if (!t?.time) {
          setStatus("out");
          return;
        }
        const arr: DayWeather[] = (t.time as string[]).map((date, i) => ({
          date,
          code: Number(t.weather_code?.[i] ?? 0),
          tmax: Math.round(Number(t.temperature_2m_max?.[i] ?? 0)),
          tmin: Math.round(Number(t.temperature_2m_min?.[i] ?? 0)),
          pop: Math.round(Number(t.precipitation_probability_max?.[i] ?? 0)),
        }));
        setDays(arr);
        setStatus("ok");
      })
      .catch(() => {
        if (active) setStatus("out");
      });
    return () => {
      active = false;
    };
  }, [lat, lng, start, end]);

  if (status === "none") return null; // 日程 or 場所が無いときは非表示

  return (
    <div className="rounded-md border border-line bg-white p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-700">
        <CloudSun className="size-4 text-brand" />
        現地の天気
      </h2>
      {status === "loading" ? (
        <p className="py-2 text-center text-xs text-gray-400">天気を読み込み中…</p>
      ) : status === "out" ? (
        <p className="py-2 text-xs text-gray-400">
          天気予報は出発の約2週間前から表示されます。
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((d) => {
            const dt = new Date(d.date);
            const wi = weatherInfo(d.code);
            return (
              <div
                key={d.date}
                className="flex w-16 shrink-0 flex-col items-center rounded-md border border-line bg-gray-50 py-2"
              >
                <span className="text-[11px] font-bold text-gray-500">
                  {dt.getMonth() + 1}/{dt.getDate()}（{WEEKDAY_JA[dt.getDay()]}）
                </span>
                <span className="my-0.5 text-2xl leading-none" title={wi.label}>
                  {wi.emoji}
                </span>
                <span className="tnum text-[11px] font-bold text-gray-800">
                  {d.tmax}°<span className="text-gray-400">/{d.tmin}°</span>
                </span>
                {d.pop > 0 && (
                  <span className="tnum text-[10px] text-sky-600">☔{d.pop}%</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
