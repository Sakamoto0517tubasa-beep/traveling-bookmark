"use client";

import { useEffect, useState } from "react";

type State =
  | { phase: "before"; days: number; hours: number; minutes: number; seconds: number }
  | { phase: "during" }
  | null;

function calc(start: string | null, end: string | null): State {
  if (!start) return null;
  const now = Date.now();
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = end ? new Date(end) : new Date(start);
  e.setHours(23, 59, 59, 999);
  const target = s.getTime();

  if (now < target) {
    let diff = Math.floor((target - now) / 1000);
    const days = Math.floor(diff / 86400);
    diff -= days * 86400;
    const hours = Math.floor(diff / 3600);
    diff -= hours * 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff - minutes * 60;
    return { phase: "before", days, hours, minutes, seconds };
  }
  if (now <= e.getTime()) return { phase: "during" };
  return null; // 旅行は終了
}

export default function CountdownTimer({
  start,
  end,
}: {
  start: string | null;
  end: string | null;
}) {
  const [t, setT] = useState<State>(null);

  useEffect(() => {
    setT(calc(start, end));
    const id = setInterval(() => setT(calc(start, end)), 1000);
    return () => clearInterval(id);
  }, [start, end]);

  if (!t) return null;

  if (t.phase === "during") {
    return (
      <div className="border-b border-line bg-brand px-4 py-3 text-center text-white">
        <span className="text-lg font-bold">✈️ 旅行中！楽しんでね</span>
      </div>
    );
  }

  const units: { label: string; value: number; accent?: boolean }[] = [
    { label: "日", value: t.days },
    { label: "時間", value: t.hours },
    { label: "分", value: t.minutes },
    { label: "秒", value: t.seconds, accent: true },
  ];

  return (
    <div className="border-b border-line bg-white px-4 pb-4 pt-3.5">
      <p className="mb-2.5 text-center text-xs font-bold tracking-wider text-brand">
        ✈️ 出発まで
      </p>
      <div className="flex items-start justify-center gap-2.5">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <span
              className={`tnum min-w-[2.4ch] rounded-lg px-3 py-2 text-center text-3xl font-extrabold leading-none text-white ${
                u.accent ? "bg-brand" : "bg-navy"
              }`}
            >
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-1.5 text-[11px] font-bold text-gray-400">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
