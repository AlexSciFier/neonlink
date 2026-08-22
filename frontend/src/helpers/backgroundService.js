const CACHE_NAME = "neonlink-bg-v1";

/**
 * Returns a blob URL for the given image API URL.
 * On the first call, fetches the image and stores the response in the
 * Cache API. On subsequent calls the response is served from cache,
 * so no network request is made.
 *
 * Falls back to the original URL if the Cache API is unavailable or
 * if the fetch fails.
 *
 * @param {string} url - Full URL to /api/image/<filename>[?w=&h=]
 * @returns {Promise<string>} blob: URL or the original URL as fallback
 */
export async function getOrCacheBgImage(url) {
  if (!("caches" in window)) return url;

  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) {
      const blob = await cached.blob();
      return URL.createObjectURL(blob);
    }

    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) return url;

    await cache.put(url, response.clone());
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}

/**
 * Removes a cached background image entry so that the next load
 * fetches a fresh copy from the server.
 *
 * @param {string} url - Same URL that was passed to getOrCacheBgImage
 */
export async function deleteBgFromCache(url) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(url);
  } catch {}
}
