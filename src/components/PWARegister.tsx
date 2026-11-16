"use client";

import { useEffect } from "react";

// Service Worker を登録（ホーム画面追加・オフライン表示のため）
export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* 失敗しても通常どおり動く */
      });
    }
  }, []);
  return null;
}
