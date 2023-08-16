import React, { useEffect } from "react";
import BookmarksHeader from "./BookmarksHeader";
import LinkTemplate from "./LinkTemplate";
import Pagination from "./Pagination";
import SceletalBokmarkList from "./SceletalBokmarkList";
import { useSearchParams } from "react-router-dom";
import { useBookMarkList } from "../../../context/bookmarkList";
import NoBookmarks from "./NoBookmarks";
import { userSettingsKeys, useUserSettingsStore } from "../../../stores/userSettingsStore";

export default function BookmarksList() {
  const [searchParams] = useSearchParams();
  const [ maxItemsInList ] = useUserSettingsStore(userSettingsKeys.MaxItemsInLinks);
  const {
    bookmarkList,
    currentPage,
    lastPage,
    isBookmarksLoading,
    fetchBookmarks,
    abort,
  } = useBookMarkList();

  useEffect(() => {
    let limit = searchParams.get("limit") || maxItemsInList;
    let page = searchParams.get("page") ?? 1;
    let offset = (page - 1) * limit;

    let tag = searchParams.get("tag");
    let category = searchParams.get("category");

    if (tag || category) {
      fetchBookmarks({ offset, limit, tag, category });
      return;
    }
    fetchBookmarks({ offset, limit });
    return () => {
      abort();
    };
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
            lastPage={lastPage}
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
