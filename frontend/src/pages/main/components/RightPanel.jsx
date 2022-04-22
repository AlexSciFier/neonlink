import React from "react";
import { TagsListProvider } from "../../../context/tagsList";
import TagList from "./TagList";

export default function RightPanel() {
  return (
    <div className="flex flex-col gap-3 p-3 w-1/3">
      <h3 className="text-xl">Categories</h3>
      <TagsListProvider>
        <TagList />
      </TagsListProvider>
    </div>
  );
}
