import React from "react";
import BookmarksList from "./components/BookmarksList";
import NavBar from "../../components/NavBar";
import RightPanel from "./components/RightPanel";
import PageBody from "../../components/PageBody";

export default function MainPage() {
  return (
    <div>
      <NavBar />
      <PageBody>
        <div className="flex justify-center w-full">
          <BookmarksList />
          <RightPanel />
        </div>
      </PageBody>
    </div>
  );
}
