import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { useBookMarkList } from "../../../context/bookmarkList";
import { DEF_MAX_ITEMS } from "../../../helpers/constants";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useRef } from "react";

export default function BookmarksHeader() {
  const [query, setQuery] = useState("");

  const delayedQuery = useCallback(debounce(updateBookmarkList, 800), [query]);

  const { fetchBookmarks } = useBookMarkList();
  const [maxItemsInList] = useLocalStorage("maxItemsInList", DEF_MAX_ITEMS);

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    delayedQuery();
    return delayedQuery.cancel;
  }, [delayedQuery, query]);

  function updateBookmarkList() {
    fetchBookmarks({ offset: 0, limit: maxItemsInList, query });
  }

  return (
    <div className="flex gap-3">
      <input
        className="py-2 px-4 flex-1 border rounded focus:outline-none focus:ring-cyan-600 focus:ring bg-transparent dark:text-white"
        type={"search"}
        placeholder={"Search"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      ></input>
    </div>
  );
}
