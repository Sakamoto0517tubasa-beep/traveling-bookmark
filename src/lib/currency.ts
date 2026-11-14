// 通貨・金額まわりのヘルパー

// よく使う通貨の目安レート（1通貨=○円）。あとで手動で調整できます。
export const CURRENCY_PRESETS: { code: string; label: string; rate: number }[] = [
  { code: "JPY", label: "日本円 ¥", rate: 1 },
  { code: "USD", label: "米ドル $", rate: 157 },
  { code: "EUR", label: "ユーロ €", rate: 170 },
  { code: "KRW", label: "韓国ウォン ₩", rate: 0.11 },
  { code: "TWD", label: "台湾ドル NT$", rate: 4.9 },
  { code: "THB", label: "タイバーツ ฿", rate: 4.5 },
  { code: "GBP", label: "英ポンド £", rate: 198 },
];

export function currencySymbol(code: string): string {
  const map: Record<string, string> = {
    JPY: "¥",
    USD: "$",
    EUR: "€",
    KRW: "₩",
    TWD: "NT$",
    THB: "฿",
    GBP: "£",
  };
  return map[code] ?? code + " ";
}

// 現地通貨 → 円
export function toYen(amount: number, rate: number): number {
  return Math.round(amount * rate);
}

export function formatYen(yen: number): string {
  return "¥" + Math.round(yen).toLocaleString("ja-JP");
}

export function formatLocal(amount: number, code: string): string {
  return currencySymbol(code) + amount.toLocaleString("ja-JP");
}
