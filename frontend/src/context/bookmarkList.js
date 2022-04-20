import { includes } from "lodash";
import React, { createContext, useContext, useState } from "react";

const BookMarkList = createContext();

export function useBookMarkList() {
  return useContext(BookMarkList);
}

export function BookMarkListProvider({ children }) {
  const [bookMarkList, setBookMarkList] = useState([]);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const [errorBookmarks, setErrorBookmarks] = useState();

  async function updateBookmarks(offset, limit) {
    setIsBookmarksLoading(true);
    setErrorBookmarks(undefined);
    let res = await fetch(
      `http://localhost:3333/api/bookmarks/?offset=${offset}&limit=${limit}`,
      {
        credentials: includes,
      }
    );
    if (res.ok) {
      setBookMarkList(res.bookmarks);
      setCurrentPage(res.currentPage);
      setMaxPage(res.maxPage);
    } else {
      setErrorBookmarks(res.json());
    }
    setIsBookmarksLoading(false);
  }

  return (
    <BookMarkList.Provider
      value={{
        bookMarkList,
        currentPage,
        maxPage,
        isBookmarksLoading,
        updateBookmarks,
      }}
    >
      {children}
    </BookMarkList.Provider>
  );
}
