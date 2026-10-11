import { getJSON } from "./fetch";

const BOOKMARKS_KEY = "neonlink_bookmarks";
const HASH_KEY = "neonlink_bookmarks_hash";

/**
 * Returns the full array of the current user's bookmarks, served from the
 * single localStorage cache (neonlink_bookmarks) whenever the per-user meta
 * hash is unchanged. This is the only bookmark cache in the app — the
 * dashboard groups it by category and the /links page filters/paginates it,
 * both client-side.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export async function getAllBookmarksWithCache(signal) {
    let cached = null;
    let cachedHash = null;
    try {
        const raw = localStorage.getItem(BOOKMARKS_KEY);
        cachedHash = localStorage.getItem(HASH_KEY);
        if (raw != null) cached = JSON.parse(raw);
    } catch (error) {
        await resetBookmarksCache();
    }

    let meta;
    try {
        const res = await getJSON("/api/bookmarks/meta", signal);
        if (!res.ok) throw new Error("Meta fetch failed");
        meta = await res.json();
    } catch (error) {
        if (cached) return cached; // offline / error: serve stale cache
        throw error;
    }

    if (cached && cachedHash === meta.hash) return cached;

    const res = await getJSON("/api/bookmarks/all", signal);
    if (!res.ok) {
        if (cached) return cached;
        throw new Error("Failed to fetch bookmarks");
    }
    const bookmarks = await res.json();
    try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        localStorage.setItem(HASH_KEY, meta.hash);
    } catch (error) {
        if (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED") {
            await resetBookmarksCache(); // run uncached rather than crash
        }
    }
    return bookmarks;
}

export async function resetBookmarksCache() {
    try {
        localStorage.removeItem(BOOKMARKS_KEY);
        localStorage.removeItem(HASH_KEY);
    } catch (error) {
        throw new Error(error.message || "Failed to remove localstorge items");
    }
}
