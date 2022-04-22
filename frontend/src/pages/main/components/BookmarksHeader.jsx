import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { useBookMarkList } from "../../../context/bookmarkList";

export default function BookmarksHeader() {
  const [query, setQuery] = useState("");

  const delayedQuery = useCallback(debounce(updateBookmarkList, 800), [query]);

  const { fetchBookmarks } = useBookMarkList();

  useEffect(() => {
    delayedQuery();
    return delayedQuery.cancel;
  }, [delayedQuery, query]);

  function updateBookmarkList() {
    console.log(query);
    fetchBookmarks(0, 10, query);
  }

  function inputHandler(e) {
    setQuery(e.target.value);
  }

  return (
    <div className="flex gap-3">
      <input
        className="py-2 px-4 flex-1 border rounded"
        type={"text"}
        placeholder={"Search"}
        value={query}
        onChange={inputHandler}
      ></input>
    </div>
  );
}
