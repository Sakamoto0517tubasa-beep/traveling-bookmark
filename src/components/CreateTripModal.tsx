"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createTrip } from "@/lib/db";
import { CURRENCY_PRESETS } from "@/lib/currency";

export default function CreateTripModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [m1, setM1] = useState("");
  const [m2, setM2] = useState("");
  const [cur, setCur] = useState("EUR");
  const [rate, setRate] = useState(
    String(CURRENCY_PRESETS.find((c) => c.code === "EUR")?.rate ?? 170),
  );
  const [saving, setSaving] = useState(false);

  function onCurChange(code: string) {
    setCur(code);
    const preset = CURRENCY_PRESETS.find((c) => c.code === code);
    if (preset) setRate(String(preset.rate));
  }

  async function submit() {
    if (!name.trim()) {
      alert("旅行名を入れてください");
      return;
    }
    setSaving(true);
    try {
      const members = [m1.trim(), m2.trim()].filter(Boolean);
      const trip = await createTrip({
        name: name.trim(),
        start_date: start || null,
        end_date: end || null,
        members,
        currency_code: cur,
        currency_rate: Number(rate) || 1,
      });
      onCreated(trip.id);
    } catch (e) {
      alert("作成に失敗しました: " + (e as Error).message);
      setSaving(false);
    }
  }

  const field = "w-full rounded-md border border-line bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand";
  const label = "mb-1 block text-xs font-bold text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-md bg-white sm:rounded-md">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-base font-bold">新しい旅行</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className={label}>旅行名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ドレスデン ふたり旅"
              className={field}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>出発</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label}>帰り</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={field} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>メンバー1</label>
              <input value={m1} onChange={(e) => setM1(e.target.value)} placeholder="自分の名前" className={field} />
            </div>
            <div>
              <label className={label}>メンバー2</label>
              <input value={m2} onChange={(e) => setM2(e.target.value)} placeholder="彼女の名前" className={field} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>現地通貨</label>
              <select value={cur} onChange={(e) => onCurChange(e.target.value)} className={field}>
                {CURRENCY_PRESETS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>1{cur} = ○円</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={field}
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            ※レートは目安です。あとで旅行の設定からいつでも変えられます。
          </p>
        </div>

        <div className="border-t border-line p-4">
          <button
            onClick={submit}
            disabled={saving}
            className="w-full rounded-md bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "作成中…" : "この内容で作る"}
          </button>
        </div>
      </div>
    </div>
  );
}
