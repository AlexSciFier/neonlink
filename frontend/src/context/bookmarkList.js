import React, { createContext, useContext, useRef, useState } from "react";
import { deleteJSON, getJSON, putJSON } from "../helpers/fetch";
import { useUserSettings } from "./settings/userSettings";

const BookMarkList = createContext();

export function useBookMarkList() {
  return useContext(BookMarkList);
}

export function BookMarkListProvider({ children }) {
  const { maxItemsInList } = useUserSettings();

  const [bookmarkList, setBookmarkList] = useState([]);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(10);
  const [errorBookmarks, setErrorBookmarks] = useState();
  const abortController = useRef(null);

  function abort() {
    abortController.current.abort();
  }

  async function fetchBookmarks({
    offset = 0,
    limit = maxItemsInList,
    query,
    tag,
    category,
  }) {
    setIsBookmarksLoading(true);
    setErrorBookmarks(undefined);

    abortController.current = new AbortController();

    let searchParams = new URLSearchParams();
    searchParams.append("offset", offset);
    searchParams.append("limit", limit);
    if (query) searchParams.append("q", query);
    if (tag) searchParams.append("tag", tag);
    if (category) searchParams.append("category", category);
    let res = await getJSON(
      `/api/bookmarks/?${searchParams.toString()}`,
      abortController.current.signal
    );
    if (res.ok) {
      let json = await res.json();
      setBookmarkList(json.bookmarks);
      setCurrentPage(json.currentPage);
      setLastPage(json.lastPage);
    } else {
      setErrorBookmarks(res.json());
    }
    setIsBookmarksLoading(false);
  }

  async function deleteBookmark(id) {
    abortController.current = new AbortController();
    let res = await deleteJSON(
      `/api/bookmarks/${id}`,
      abortController.current.signal
    );
    if (res.ok) {
      setBookmarkList(bookmarkList.filter((item) => item.id !== id));
    } else {
      console.error(await res.json());
    }
  }

  async function changePositions(idPositionPairArray) {
    abortController.current = new AbortController();
    await putJSON(
      `api/bookmarks/changePositions`,
      idPositionPairArray,
      abortController.current.signal
    );
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
