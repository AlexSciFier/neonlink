import React, { createContext, useContext, useRef, useState } from "react";
import { deleteJSON, putJSON } from "../helpers/fetch";
import {
  useUserSettingsStore,
  userSettingsKeys,
} from "../stores/userSettingsStore";
import { getAllBookmarksWithCache, resetBookmarksCache } from "../helpers/bookmarkService";

const BookMarkList = createContext();

export function useBookMarkList() {
  return useContext(BookMarkList);
}

export function BookMarkListProvider({ children }) {
  const [maxItemsInList] = useUserSettingsStore(
    userSettingsKeys.MaxItemsInLinks
  );

  const [bookmarkList, setBookmarkList] = useState([]);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(10);
  const [errorBookmarks, setErrorBookmarks] = useState();
  const abortController = useRef(null);

  function abort() {
    abortController.current.abort();
  }

  async function fetchBookmarks({ offset = 0, limit, query, tag, category }) {
    setIsBookmarksLoading(true);
    setErrorBookmarks(undefined);

    abortController.current?.abort();
    abortController.current = new AbortController();

    // Coerce: searchParams pass strings and maxItemsInList may be undefined
    // on the first render before user settings load.
    const pageSize = Number(limit) || Number(maxItemsInList) || 10;
    const start = Number(offset) || 0;

    try {
      const all = await getAllBookmarksWithCache(abortController.current.signal);

      let filtered = all;

      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            (b.title && b.title.toLowerCase().includes(q)) ||
            (b.url && b.url.toLowerCase().includes(q)) ||
            (b.desc && b.desc.toLowerCase().includes(q))
        );
      }
      if (tag) {
        filtered = filtered.filter((b) => b.tags?.includes(tag));
      }
      if (category) {
        // /links params carry the category NAME (see CategoryItem.jsx)
        filtered = filtered.filter((b) => b.categoryName === category);
      }

      const total = filtered.length;
      const pageItems = filtered.slice(start, start + pageSize);

      setBookmarkList(pageItems);
      setCurrentPage(Math.floor(start / pageSize) + 1);
      setLastPage(Math.max(1, Math.ceil(total / pageSize)));
    } catch (error) {
      if (error?.name === "AbortError") return;
      setErrorBookmarks(error.message);
    } finally {
      setIsBookmarksLoading(false);
    }
  }

  async function deleteBookmark(id) {
    abortController.current = new AbortController();
    let res = await deleteJSON(
      `/api/bookmarks/${id}`,
      abortController.current.signal
    );
    if (res.ok) {
      await resetBookmarksCache()
      setBookmarkList(bookmarkList.filter((item) => item.id !== id));
    } else {
      console.error(await res.json());
    }
  }

  async function changePositions(idPositionPairArray) {
    abortController.current = new AbortController();
    let res = await putJSON(
      `api/bookmarks/changePositions`,
      idPositionPairArray,
      abortController.current.signal
    );

    if(res.ok) await resetBookmarksCache()
  }

  return (
    <BookMarkList.Provider
      value={{
        bookmarkList,
        errorBookmarks,
        currentPage,
        lastPage,
        isBookmarksLoading,
        fetchBookmarks,
        deleteBookmark,
        changePositions,
        abort,
      }}
    >
      {children}
    </BookMarkList.Provider>
  );
}
