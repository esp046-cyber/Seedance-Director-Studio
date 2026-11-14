"use strict";
const VERSION = "seedance-studio-2026-11-14-v1";
const SHELL = VERSION + "-shell",
  RUNTIME = VERSION + "-runtime",
  PREFIX = "seedance-studio-";
const ROOT = new URL("./", self.location.href).href;
const ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/data.js",
  "./js/app.js",
  "./scripts/generate-icons.js",
  "./favicon.svg",
  "./favicon.ico",
  "./apple-touch-icon.png",
  "./robots.txt",
  "./images/logo-partnership.svg",
  "./images/logo-1billion-dubai.svg",
  "./images/logo-byteplus.svg",
  "./images/ref-cinematography.svg",
  "./icons/og-image.svg",
  "./icons/og-image.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/favicon-16x16.png",
  "./icons/favicon-32x32.png",
  "./screenshots/screenshot-wide.png",
  "./screenshots/screenshot-narrow.png",
].map((p) => new URL(p, ROOT).href);
const SHELL_URLS = new Set(ASSETS);
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await cache.addAll(
        ASSETS.map((url) => new Request(url, { cache: "reload" })),
      );
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(PREFIX) && k !== SHELL && k !== RUNTIME)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
async function match(url) {
  return (
    (await (await caches.open(SHELL)).match(url)) ||
    (await (await caches.open(RUNTIME)).match(url))
  );
}
async function remember(request, response) {
  if (
    !response ||
    !response.ok ||
    response.type !== "basic" ||
    response.headers.get("Cache-Control")?.includes("no-store")
  )
    return;
  const cache = await caches.open(RUNTIME);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  if (keys.length > 80)
    await Promise.all(
      keys.slice(0, keys.length - 80).map((k) => cache.delete(k)),
    );
}
async function networkNavigation(request) {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (response.ok) {
      await remember(request, response);
      return response;
    }
    if (response.status < 500) return response;
    throw Error("Server temporarily unavailable");
  } catch {
    const url = new URL(request.url);
    const exact = await match(request);
    if (exact) return exact;
    if (
      url.pathname === new URL(ROOT).pathname ||
      url.pathname === new URL("index.html", ROOT).pathname
    )
      return (
        (await match(new URL("index.html", ROOT).href)) || Response.error()
      );
    return (
      (await match(new URL("offline.html", ROOT).href)) || Response.error()
    );
  } finally {
    clearTimeout(timer);
  }
}
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.href.startsWith(ROOT)
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(networkNavigation(request));
    return;
  }
  if (SHELL_URLS.has(url.href)) {
    event.respondWith(
      (async () => {
        const cached = await match(request);
        if (cached) return cached;
        const response = await fetch(request);
        await remember(request, response);
        return response;
      })(),
    );
    return;
  }
  if (!/\.(?:css|js|svg|png|ico|webmanifest|woff2?)$/i.test(url.pathname))
    return;
  const refresh = fetch(request).then(async (response) => {
    await remember(request, response);
    return response;
  });
  event.waitUntil(
    refresh.then(
      () => {},
      () => {},
    ),
  );
  event.respondWith(
    (async () => {
      const cached = await match(request);
      if (cached) return cached;
      try {
        return await refresh;
      } catch {
        return Response.error();
      }
    })(),
  );
});
