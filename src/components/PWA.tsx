"use client";

import { useEffect } from "react";

export default function PWA() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.hostname !== "localhost") {
      navigator.serviceWorker
        .register("/wans/sw", { scope: "/" })
        .then((reg) => navigator.serviceWorker.ready)
        .catch(() => {});
    }
  }, []);

  return null;
}