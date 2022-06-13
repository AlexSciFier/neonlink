import React, { createContext, useContext, useState } from "react";
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

  async function fetchBookmarks({ offset = 0, limit = 25, query, tag }) {
    setIsBookmarksLoading(true);
    setErrorBookmarks(undefined);

    let searchParams = new URLSearchParams();
    searchParams.append("offset", offset);
    searchParams.append("limit", limit);
    query && searchParams.append("q", query);
    tag && searchParams.append("tag", tag);
    let res = await getJSON(`/api/bookmarks/?${searchParams}`);
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
    let res = await deleteJSON(`/api/bookmarks/${id}`, {
      credentials: "include",
      method: "DELETE",
    });
    if (res.ok) {
      console.log(await res.json());
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
      }}
    >
      {children}
    </BookMarkList.Provider>
  );
}
