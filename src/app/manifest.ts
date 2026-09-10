import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WANPLAN",
    short_name: "WANPLAN",
    description: "wanland planner - inventory & sales management",
    start_url: "/wans/dashboard",
    scope: "/wans/dashboard",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#4338ca",
    icons: [
      { src: "/wans/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/wans/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/wans/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}