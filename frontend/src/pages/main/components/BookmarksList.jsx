import React, { useEffect } from "react";
import BookmarksHeader from "./BookmarksHeader";
import LinkTemplate from "./LinkTemplate";
import Pagination from "./Pagination";
import SceletalBokmarkList from "./SceletalBokmarkList";
import { useSearchParams } from "react-router-dom";
import { useBookMarkList } from "../../../context/bookmarkList";
import NoBookmarks from "./NoBookmarks";

export default function BookmarksList() {
  const [searchParams] = useSearchParams();

  const {
    bookmarkList,
    currentPage,
    maxPage,
    isBookmarksLoading,
    fetchBookmarks,
  } = useBookMarkList();

  useEffect(() => {
    let limit = searchParams.get("limit") || 10;
    let page = searchParams.get("page") ?? 1;
    let offset = (page - 1) * limit;

    let tag = searchParams.get("tag");
    if (tag) {
      fetchBookmarks({ offset, limit, tag });
      return;
    }
    fetchBookmarks({ offset, limit });
  }, [searchParams]);

  return (
    <div className="lg:w-2/4 my-3 space-y-6">
      <BookmarksHeader />
      {isBookmarksLoading ? (
        <SceletalBokmarkList />
      ) : bookmarkList?.length > 0 ? (
        <>
          <div className="flex flex-col divide-y overflow-hidden">
            {bookmarkList.map((bookmark, idx) => (
              <LinkTemplate bookmark={bookmark} key={idx} />
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
