import React from "react";
import { useSearchParams } from "react-router-dom";

export default function TagItem({ tag }) {
  const [searchParams, setSearchParams] = useSearchParams();
  let selected = searchParams.get("tag") === tag.name;

  if (searchParams.has("tag")) {
    if (searchParams.get("tag") === tag.name) {
      searchParams.delete("tag");
    } else {
      searchParams.set("tag", tag.name);
    }
  } else {
    searchParams.append("tag", tag.name);
  }

  return (
    <div
      onClick={() => setSearchParams(searchParams)}
      className={`hover:underline hover:text-cyan-700 cursor-pointer capitalize px-4 py-1 rounded ${
        selected && "bg-cyan-400 text-white font-medium"
      }`}
    >
      #{tag.name}
    </div>
  );
}
