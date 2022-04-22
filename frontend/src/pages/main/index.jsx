import React from "react";
import BookmarksList from "./components/BookmarksList";
import NavBar from "../../components/NavBar";
import RightPanel from "./components/RightPanel";
import PageBody from "../../components/PageBody";
import { BookMarkListProvider } from "../../context/bookmarkList";

export default function MainPage() {
  return (
    <div>
      <NavBar />
      <PageBody>
        <div className="flex flex-col justify-center w-full md:flex-row px-20">
          <BookMarkListProvider>
            <BookmarksList />
            <RightPanel />
          </BookMarkListProvider>
        </div>
      </PageBody>
    </div>
  );
}
