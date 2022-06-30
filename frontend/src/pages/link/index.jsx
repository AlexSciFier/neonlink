import React from "react";
import BookmarksList from "./components/BookmarksList";
import RightPanel from "./components/rightPanel/RightPanel";
import { BookMarkListProvider } from "../../context/bookmarkList";
import Page from "../../components/Page";

export default function LinksPage() {
  return (
    <Page>
      <div className="flex flex-col gap-4 justify-center w-full md:flex-row">
        <BookMarkListProvider>
          <BookmarksList />
          <RightPanel />
        </BookMarkListProvider>
      </div>
    </Page>
  );
}
