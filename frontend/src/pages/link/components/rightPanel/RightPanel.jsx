import React from "react";
import { TagsListProvider } from "../../../../context/tagsList";
import TagList from "./TagList";

export default function RightPanel() {
  return (
    <div className="flex flex-col gap-3 p-3 md:w-1/5 dark:text-white">
      <h3 className="text-xl">Tags</h3>
      <TagsListProvider>
        <TagList />
      </TagsListProvider>
    </div>
  );
}
