"use client";

import { supabase } from "./supabase";
import { countryCodeFromAddress } from "./countries";
import type {
  Trip,
  Spot,
  PackingItem,
  Expense,
  SpotCategory,
  DayPlan,
  ScheduleItem,
  LinkItem,
  TripPackingItem,
  SouvenirItem,
} from "./types";

// ---- Trip ----
export async function listTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("om_trips")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Trip[];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from("om_trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Trip) ?? null;
}

export async function createTrip(input: {
  name: string;
  start_date: string | null;
  end_date: string | null;
  members: string[];
  currency_code: string;
  currency_rate: number;
}): Promise<Trip> {
  const { data, error } = await supabase
    .from("om_trips")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Trip;
}

export async function updateTrip(id: string, patch: Partial<Trip>) {
  const { error } = await supabase.from("om_trips").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTrip(id: string) {
  const { error } = await supabase.from("om_trips").delete().eq("id", id);
  if (error) throw error;
}

// 各旅行の最初のスポットの住所から国コード（ISO2）を推定して返す
export async function getTripCountryCodes(
  tripIds: string[],
): Promise<Record<string, string>> {
  if (tripIds.length === 0) return {};
  const { data, error } = await supabase
    .from("om_spots")
    .select("trip_id,address,order_index,created_at")
    .in("trip_id", tripIds)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  const out: Record<string, string> = {};
  for (const row of (data ?? []) as { trip_id: string; address: string | null }[]) {
    if (out[row.trip_id]) continue;
    const code = countryCodeFromAddress(row.address);
    if (code) out[row.trip_id] = code;
  }
  return out;
}

// ---- Spot ----
export async function listSpots(tripId: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from("om_spots")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Spot[];
}

export async function getSpot(id: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from("om_spots")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Spot) ?? null;
}

export async function createSpot(input: {
  trip_id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  category: SpotCategory;
  photo: string | null;
  place_id?: string | null;
}): Promise<Spot> {
  const { data, error } = await supabase
    .from("om_spots")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Spot;
}

export async function updateSpot(id: string, patch: Partial<Spot>) {
  const { error } = await supabase.from("om_spots").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSpot(id: string) {
  const { error } = await supabase.from("om_spots").delete().eq("id", id);
  if (error) throw error;
}

// ---- Packing ----
export async function listPacking(spotId: string): Promise<PackingItem[]> {
  const { data, error } = await supabase
    .from("om_packing")
    .select("*")
    .eq("spot_id", spotId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PackingItem[];
}

export async function addPacking(spotId: string, label: string): Promise<PackingItem> {
  const { data, error } = await supabase
    .from("om_packing")
    .insert({ spot_id: spotId, label })
    .select("*")
    .single();
  if (error) throw error;
  return data as PackingItem;
}

export async function togglePacking(id: string, checked: boolean) {
  const { error } = await supabase
    .from("om_packing")
    .update({ checked })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePacking(id: string) {
  const { error } = await supabase.from("om_packing").delete().eq("id", id);
  if (error) throw error;
}

// ---- Expense ----
export async function listExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("om_expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function addExpense(input: {
  trip_id: string;
  spot_id: string | null;
  payer: string;
  amount: number;
  label: string | null;
}): Promise<Expense> {
  const { data, error } = await supabase
    .from("om_expenses")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("om_expenses").delete().eq("id", id);
  if (error) throw error;
}

// ---- しおり：日ごとのテーマ（om_days）----
export async function listDays(tripId: string): Promise<DayPlan[]> {
  const { data, error } = await supabase
    .from("om_days")
    .select("*")
    .eq("trip_id", tripId)
    .order("day", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DayPlan[];
}

export async function upsertDay(
  tripId: string,
  day: number,
  patch: { title?: string | null; note?: string | null },
): Promise<DayPlan> {
  const { data, error } = await supabase
    .from("om_days")
    .upsert({ trip_id: tripId, day, ...patch }, { onConflict: "trip_id,day" })
    .select("*")
    .single();
  if (error) throw error;
  return data as DayPlan;
}

// ---- しおり：時間つき予定（om_schedule）----
export async function listSchedule(tripId: string): Promise<ScheduleItem[]> {
  const { data, error } = await supabase
    .from("om_schedule")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScheduleItem[];
}

export async function addSchedule(input: {
  trip_id: string;
  day: number;
  time: string | null;
  label: string;
  order_index: number;
}): Promise<ScheduleItem> {
  const { data, error } = await supabase
    .from("om_schedule")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as ScheduleItem;
}

export async function updateSchedule(
  id: string,
  patch: Partial<Pick<ScheduleItem, "time" | "label" | "order_index" | "day">>,
) {
  const { error } = await supabase.from("om_schedule").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSchedule(id: string) {
  const { error } = await supabase.from("om_schedule").delete().eq("id", id);
  if (error) throw error;
}

// ---- リンク・予約（om_links）----
export async function listLinks(tripId: string): Promise<LinkItem[]> {
  const { data, error } = await supabase
    .from("om_links")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LinkItem[];
}

export async function addLink(input: {
  trip_id: string;
  label: string;
  url: string | null;
  memo: string | null;
  order_index: number;
}): Promise<LinkItem> {
  const { data, error } = await supabase
    .from("om_links")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as LinkItem;
}

export async function deleteLink(id: string) {
  const { error } = await supabase.from("om_links").delete().eq("id", id);
  if (error) throw error;
}

// ---- 旅行全体の持ち物（om_trip_packing）----
export async function listTripPacking(tripId: string): Promise<TripPackingItem[]> {
  const { data, error } = await supabase
    .from("om_trip_packing")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TripPackingItem[];
}

export async function addTripPacking(
  tripId: string,
  label: string,
  orderIndex: number,
): Promise<TripPackingItem> {
  const { data, error } = await supabase
    .from("om_trip_packing")
    .insert({ trip_id: tripId, label, order_index: orderIndex })
    .select("*")
    .single();
  if (error) throw error;
  return data as TripPackingItem;
}

export async function toggleTripPacking(id: string, checked: boolean) {
  const { error } = await supabase
    .from("om_trip_packing")
    .update({ checked })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTripPacking(id: string) {
  const { error } = await supabase.from("om_trip_packing").delete().eq("id", id);
  if (error) throw error;
}

// ---- お土産リスト（om_souvenirs）----
export async function listSouvenirs(tripId: string): Promise<SouvenirItem[]> {
  const { data, error } = await supabase
    .from("om_souvenirs")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SouvenirItem[];
}

export async function addSouvenir(input: {
  trip_id: string;
  label: string;
  recipient: string | null;
  order_index: number;
}): Promise<SouvenirItem> {
  const { data, error } = await supabase
    .from("om_souvenirs")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as SouvenirItem;
}

export async function toggleSouvenir(id: string, checked: boolean) {
  const { error } = await supabase
    .from("om_souvenirs")
    .update({ checked })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSouvenir(id: string) {
  const { error } = await supabase.from("om_souvenirs").delete().eq("id", id);
  if (error) throw error;
}
