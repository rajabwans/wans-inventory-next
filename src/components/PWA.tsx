"use client";

import { useEffect } from "react";

export default function PWA() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.hostname !== "localhost") {
      navigator.serviceWorker.register("/wans/sw.js").catch(() => {});
    }
  }, []);

  return null;
}