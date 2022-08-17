import React, { createContext, useContext, useRef, useState } from "react";
import { deleteJSON, getJSON } from "../helpers/fetch";

const BookMarkList = createContext();

export function useBookMarkList() {
  return useContext(BookMarkList);
}

export function BookMarkListProvider({ children }) {
  const [bookmarkList, setBookmarkList] = useState([]);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const [errorBookmarks, setErrorBookmarks] = useState();
  const abortController = useRef(null);

  function abort() {
    abortController.current.abort();
  }

  async function fetchBookmarks({ offset = 0, limit = 25, query, tag }) {
    setIsBookmarksLoading(true);
    setErrorBookmarks(undefined);

    abortController.current = new AbortController();

    let searchParams = new URLSearchParams();
    searchParams.append("offset", offset);
    searchParams.append("limit", limit);
    if (query) searchParams.append("q", query);
    if (tag) searchParams.append("tag", tag);
    let res = await getJSON(
      `/api/bookmarks/?${searchParams.toString()}`,
      abortController.current.signal
    );
    if (res.ok) {
      let json = await res.json();
      setBookmarkList(json.bookmarks);
      setCurrentPage(json.currentPage);
      setMaxPage(json.maxPage);
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

  return (
    <BookMarkList.Provider
      value={{
        bookmarkList,
        errorBookmarks,
        currentPage,
        maxPage,
        isBookmarksLoading,
        fetchBookmarks,
        deleteBookmark,
        abort,
      }}
    >
      {children}
    </BookMarkList.Provider>
  );
}
