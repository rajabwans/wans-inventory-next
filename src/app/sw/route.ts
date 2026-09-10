export async function GET() {
  // Kill-switch service worker: claims the root scope (Service-Worker-Allowed: /),
  // wipes every old cache from earlier deployments, and unregisters itself.
  // This clears the stale service workers/caches that were serving broken pages.
  const sw = `
const VERSION = 'wanplan-reset-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    await self.clients.claim();
  })());
});
`;
  return new Response(sw, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}