import React from "react";
import { CategoriesListProvider } from "../../../../context/categoriesList";
import { TagsListProvider } from "../../../../context/tagsList";
import CategoryList from "./CategoryList";
import TagList from "./TagList";

export default function RightPanel() {
  return (
    <div className="flex flex-col gap-3 p-3 md:w-1/5 dark:text-white">
      <h3 className="text-xl">Categories</h3>
      <CategoriesListProvider>
        <CategoryList />
      </CategoriesListProvider>
      <h3 className="text-xl">Tags</h3>
      <TagsListProvider>
        <TagList />
      </TagsListProvider>
    </div>
  );
}
