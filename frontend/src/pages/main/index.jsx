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
        <div className="flex flex-col justify-center w-full md:flex-row">
          <BookmarksList />
          <RightPanel />
        </div>
      </PageBody>
    </div>
  );
}
