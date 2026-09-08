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
const CACHE = 'cooee-15b2809f7224'
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

/**
 * ONE FILE AT A TIME, BECAUSE `addAll` IS ALL OR NOTHING.
 *
 * It was `c.addAll(SHELL)`, and `addAll` rejects the whole call if any single
 * request fails. The shell listed two icons that no build step produced, so
 * every install rejected, the `.catch` below swallowed it, and the cache stayed
 * EMPTY — proven in Chromium against the real built page: after a first online
 * visit, `caches.open(...).keys()` returned `[]`. The feature announced on the
 * front page was off, silently, in the exact shape this project keeps finding:
 * an absence rendered as a success.
 *
 * The icons are built now, so the immediate cause is gone. This stays because
 * the FAILURE MODE is what matters: a precache that turns the whole offline
 * copy off because one file is missing is a trade nobody would choose, and the
 * next file added to the shell is the next chance to make it. Six of seven
 * cached is six more than none.
 *
 * The `catch` per item, not around the lot: an install that fails takes the new
 * worker with it, and a missing icon must not cost a shipped fix.
 */
self.addEventListener('install', (e) => {
  // Take over immediately: a half-updated page serving one version's HTML with
  // another version's script is worse than either version.
  self.skipWaiting()
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})))
  })())
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
      return reveal(request, cached)
    }
  })())
})

/**
 * THE BANNER, RAISED BY THE ONLY PARTY THAT KNOWS.
 *
 * The page carries a hidden note saying *this is the copy your phone saved on
 * <date> — if an organisation has changed a number since then, this will not
 * know*, and it was un-hidden on `navigator.onLine === false`. The reasoning
 * beside it is right about `onLine` — false really does mean no network — and
 * it answers the wrong question. The banner's subject is not whether there is a
 * network, it is whether the reader is looking at a CACHED COPY, and the two
 * come apart in exactly the case this feature was built for: a shop with one
 * bar, where `onLine` is true, the fetch above times out, and this line serves
 * the saved page. Driven in Chromium with the server stopped: the cached page
 * rendered, `navigator.onLine` was `true`, and the banner stayed hidden.
 *
 * That is one decision derived twice from two different inputs, which is this
 * project's oldest defect shape. The worker does not derive it — it IS the
 * party that fell back, so it says so, here.
 *
 * REWRITTEN INTO THE MARKUP RATHER THAN POSTED AS A MESSAGE, for the reason
 * already written into the page: the note lives in the HTML and is not built by
 * a script, because a banner assembled by a script that failed is a banner
 * nobody sees. A `postMessage` would need a client that is listening — on a
 * navigation there is none yet — and would need the worker to remember, which a
 * worker that can be terminated between events cannot. This needs neither, and
 * it survives the page's JavaScript failing entirely.
 *
 * Documents only. The marker is one attribute in one element, and rewriting a
 * script or an icon would be nonsense.
 */
const CACHED_MARK = ['id="loffline"', ' hidden']

async function reveal(request, cached) {
  const isDocument = request.destination === 'document' || request.mode === 'navigate'
  if (!isDocument) return cached
  try {
    const html = await cached.text()
    return new Response(
      html.replace(CACHED_MARK[0] + CACHED_MARK[1], CACHED_MARK[0] + ' data-cached'),
      { status: cached.status, statusText: cached.statusText, headers: cached.headers },
    )
  } catch {
    // A copy the reader can act on beats a copy that announces itself, so a
    // failure here returns the page rather than nothing.
    return cached
  }
}
