// おでかけマップ 型定義

export type SpotCategory =
  | "sightseeing"
  | "food"
  | "cafe"
  | "lodging"
  | "shopping"
  | "other";

export type Trip = {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  members: string[];
  cover_photo: string | null;
  currency_code: string;
  currency_rate: number;
  budget: number | null; // 旅行の目標予算（円）
  created_at: string;
};

export type Spot = {
  id: string;
  trip_id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  place_id: string | null;
  category: SpotCategory;
  tags: string[];
  admission_fee: number;
  hotel_name: string | null;
  hotel_fee: number;
  photo: string | null;
  hours_memo: string | null;
  day: number | null;
  order_index: number;
  likes: number; // 行きたい度（ハートのタップ回数）
  visited: boolean;
  memory_note: string | null;
  memory_photo: string | null;
  created_at: string;
};

export type PackingItem = {
  id: string;
  spot_id: string;
  label: string;
  checked: boolean;
  order_index: number;
  created_at: string;
};

export type Expense = {
  id: string;
  trip_id: string;
  spot_id: string | null;
  payer: string;
  amount: number;
  label: string | null;
  created_at: string;
};

// 日ごとのテーマ・メモ（しおりの日付見出し）
export type DayPlan = {
  id: string;
  trip_id: string;
  day: number;
  title: string | null;
  note: string | null;
  created_at: string;
};

// 時間つきの予定（しおりのタイムライン1行）
export type ScheduleItem = {
  id: string;
  trip_id: string;
  day: number;
  time: string | null;
  label: string;
  order_index: number;
  created_at: string;
};

// リンク・予約（航空券/ホテル/チケットの予約リンクやメモ）
export type LinkItem = {
  id: string;
  trip_id: string;
  label: string;
  url: string | null;
  memo: string | null;
  order_index: number;
  created_at: string;
};

// 旅行全体の持ち物（スポットごとの om_packing とは別）
export type TripPackingItem = {
  id: string;
  trip_id: string;
  label: string;
  checked: boolean;
  order_index: number;
  created_at: string;
};

// お土産リスト（何を・誰に・買ったか）
export type SouvenirItem = {
  id: string;
  trip_id: string;
  label: string;        // 何を
  recipient: string | null; // 誰に
  checked: boolean;     // 買ったか
  order_index: number;
  created_at: string;
};

export const CATEGORY_META: Record<
  SpotCategory,
  { label: string; color: string; pin: string }
> = {
  sightseeing: { label: "観光", color: "#2563EB", pin: "#2563EB" },
  food: { label: "食事", color: "#EA580C", pin: "#EA580C" },
  cafe: { label: "カフェ", color: "#B45309", pin: "#B45309" },
  lodging: { label: "宿泊", color: "#E11D48", pin: "#E11D48" },
  shopping: { label: "買い物", color: "#059669", pin: "#059669" },
  other: { label: "その他", color: "#6B7280", pin: "#6B7280" },
};
