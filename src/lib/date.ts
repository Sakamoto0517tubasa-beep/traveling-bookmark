// 出発までのカウントダウン文言。start_date が無ければ null。
export function tripCountdown(
  start: string | null,
  end: string | null,
): { text: string; soon: boolean } | null {
  if (!start) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = end ? new Date(end) : s;
  e.setHours(0, 0, 0, 0);
  const diff = Math.round((s.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return { text: `出発まであと${diff}日`, soon: diff <= 7 };
  if (today.getTime() <= e.getTime()) return { text: "旅行中！", soon: true };
  return null; // 旅行は終了
}

// しおり用の日付ラベル（start_date から day 日目の日付）
export const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function dateForDay(start: string | null, day: number): Date | null {
  if (!start) return null;
  const d = new Date(start);
  d.setDate(d.getDate() + (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

// YYYY-MM-DD（ローカル）
export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
