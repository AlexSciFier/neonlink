import { includes } from "lodash";
import React, { createContext, useContext, useState } from "react";
import { getJSON } from "../helpers/fetch";

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

  const [position, setPosition] = useState({ offset: 0, limit: 0 });

  async function fetchBookmarks(offset, limit, query) {
    setPosition({ offset, limit });
    setIsBookmarksLoading(true);
    setErrorBookmarks(undefined);

    let searchParams = new URLSearchParams();
    searchParams.append("offset", offset);
    searchParams.append("limit", limit);
    query && searchParams.append("q", query);

    let url = new URL(
      `/api/bookmarks/?${searchParams}`,
      "http://localhost:3333"
    ).toString();
    let res = await getJSON(url);
    console.log(url);
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
    let res = await fetch(`http://localhost:3333/api/bookmarks/${id}`, {
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
