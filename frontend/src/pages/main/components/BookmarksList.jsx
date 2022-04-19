import React, { useEffect, useState } from "react";
import BookmarksHeader from "./BookmarksHeader";
import LinkTemplate from "./LinkTemplate";
import Pagination from "./Pagination";
import SceletalBokmarkList from "./SceletalBokmarkList";
import { useSearchParams } from "react-router-dom";
import { getJSON } from "../../../helpers/fetch";

export default function BookmarksList() {
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setIsLoading(true);
    async function fetchData() {
      let limit = searchParams.get("limit") || 10;
      let page = searchParams.get("page") ?? 1;
      let offset = (page - 1) * limit;
      let res = await getJSON(
        `http://localhost:3333/api/bookmarks/?offset=${offset}&limit=${limit}`
      );
      if (res.ok) {
        setIsLoading(false);
        setResponse(await res.json());
      } else {
        setIsLoading(false);
        console.error(await res.json());
      }
    }
    fetchData();
  }, [searchParams]);

  return (
    <div className="lg:w-1/3 my-3 space-y-6">
      <BookmarksHeader />
      {isLoading ? (
        <SceletalBokmarkList />
      ) : response.bookmarks?.length > 0 ? (
        <>
          <div className="flex flex-col divide-y overflow-hidden">
            {response.bookmarks.map((bookmark, idx) => (
              <LinkTemplate bookmark={bookmark} key={idx} />
            ))}
          </div>
          <Pagination
            maxPage={response.maxPage}
            currentPage={response.currentPage}
            siblings={1}
          />
        </>
      ) : (
        <div>No bookmarks</div>
      )}
    </div>
  );
}
