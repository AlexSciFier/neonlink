import React, { useEffect } from "react";
import { useCategoriesList } from "../../../../context/categoriesList";
import CategoryItem from "./CategoryItem";

export default function CategoryList() {
  const { categories, fetchCategories, abort } = useCategoriesList();

  useEffect(() => {
    fetchCategories();
    return () => abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (categories.length === 0) return <div>No categories</div>;
  return (
    <div className="flex flex-col">
      {categories.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}
    </div>
  );
}
