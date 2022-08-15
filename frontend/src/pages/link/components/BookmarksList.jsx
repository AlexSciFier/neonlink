import React, { useEffect } from "react";
import BookmarksHeader from "./BookmarksHeader";
import LinkTemplate from "./LinkTemplate";
import Pagination from "./Pagination";
import SceletalBokmarkList from "./SceletalBokmarkList";
import { useSearchParams } from "react-router-dom";
import { useBookMarkList } from "../../../context/bookmarkList";
import NoBookmarks from "./NoBookmarks";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { DEF_MAX_ITEMS } from "../../../helpers/constants";

export default function BookmarksList() {
  const [searchParams] = useSearchParams();
  const [maxItemsInList] = useLocalStorage("maxItemsInList", DEF_MAX_ITEMS);
  const {
    bookmarkList,
    currentPage,
    maxPage,
    isBookmarksLoading,
    fetchBookmarks,
  } = useBookMarkList();

  useEffect(() => {
    let limit = searchParams.get("limit") || maxItemsInList;
    let page = searchParams.get("page") ?? 1;
    let offset = (page - 1) * limit;

    let tag = searchParams.get("tag");
    if (tag) {
      fetchBookmarks({ offset, limit, tag });
      return;
    }
    fetchBookmarks({ offset, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="lg:w-2/5 px-3 my-2 space-y-6">
      <BookmarksHeader />
      {isBookmarksLoading ? (
        <SceletalBokmarkList />
      ) : bookmarkList?.length > 0 ? (
        <>
          <div className="flex flex-col overflow-hidden">
            {bookmarkList
              .sort((a, b) => new Date(b.created) - new Date(a.created))
              .map((bookmark) => (
                <LinkTemplate bookmark={bookmark} key={bookmark.id} />
              ))}
          </div>
          <Pagination
            maxPage={maxPage}
            currentPage={currentPage}
            siblings={1}
          />
        </>
      ) : (
        <NoBookmarks />
      )}
    </div>
  );
}
