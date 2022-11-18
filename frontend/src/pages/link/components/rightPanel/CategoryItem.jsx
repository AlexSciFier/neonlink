import React from "react";
import { useSearchParams } from "react-router-dom";

export default function CategoryItem({ category }) {
  const [searchParams, setSearchParams] = useSearchParams();
  let selected = searchParams.get("category") === category.name;

  if (searchParams.has("category")) {
    if (searchParams.get("category") === category.name) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category.name);
    }
  } else {
    searchParams.append("category", category.name);
  }

  return (
    <div
      onClick={() => setSearchParams(searchParams)}
      className={`hover:underline hover:text-cyan-700 cursor-pointer capitalize px-4 py-1 rounded ${
        selected && "bg-cyan-400 text-white font-medium"
      }`}
    >
      {category.name}
    </div>
  );
}
