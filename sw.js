/**
 * The offline copy.
 *
 * NETWORK FIRST, NOT CACHE FIRST, and that is the opposite of the usual advice.
 * A service worker is normally told to serve the cache and update in the
 * background, because it is fast and because a slightly old page is harmless.
 * Neither reason holds here. This page's whole value is that the numbers in it
 * were checked against the organisations' own pages, and a bank changing its
 * fraud line while somebody reads a cached copy is exactly the failure the
 * registry exists to prevent. Fast and wrong is the wrong trade for a page
 * people open while being scammed.
 *
 * So: try the network with a short timeout, fall back to the cache, and keep
 * the cache fresh on every success. Online you always get today's answer.
 * Offline — a shop with one bar, a train, an old phone in a black spot — you
 * get the last copy, and the page says so and says when it was taken.
 *
 * `CACHE` carries a build stamp, so a new build creates a new cache and the old
 * one is deleted on activate. Nothing is served from a version nobody shipped.
 */
const CACHE = 'cooee-ba2a0c4dad3f'
const SHELL = [
  './',
  './index.html',
  './cooee.js',
  './page.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
]
/** Long enough for a slow connection, short enough not to feel broken. */
const NETWORK_TIMEOUT = 3500

self.addEventListener('install', (e) => {
  // Take over immediately: a half-updated page serving one version's HTML with
  // another version's script is worse than either version.
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Same origin only. The fonts come from Google and are the browser's to
  // cache; intercepting third-party requests here would put us between the
  // reader and somebody else's server for no gain.
  if (url.origin !== self.location.origin) return

  e.respondWith((async () => {
    const cache = await caches.open(CACHE)
    try {
      const fresh = await Promise.race([
        fetch(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), NETWORK_TIMEOUT)),
      ])
      if (fresh && fresh.ok) {
        cache.put(request, fresh.clone()).catch(() => {})
        return fresh
      }
      throw new Error('bad response')
    } catch {
      const cached = await cache.match(request) || await cache.match('./index.html')
      // No network and nothing cached: let the browser show its own offline
      // page rather than inventing one that might look like an answer.
      if (!cached) throw new Error('offline and uncached')
      return cached
    }
  })())
})
