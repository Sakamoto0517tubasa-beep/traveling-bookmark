"use client";

import { createClient } from "@supabase/supabase-js";

// ブラウザ用 Supabase クライアント（anonキー）。
// このアプリはログインなし・共有リンク運用のため、クライアントから直接読み書きします。
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = !!url && !!anon;

// キー未設定でも createClient が例外を投げないようダミー値でフォールバック。
// 実際の読み書きは hasSupabase が true のときだけ行う。
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder-anon-key",
);
