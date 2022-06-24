import React from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function TagItem({ tag }) {
  const [searchParams, setSearchParams] = useSearchParams();
  let searchTag = searchParams.get("tag");
  return (
    <Link
      to={`/links?tag=${tag.name}`}
      className={`hover:underline hover:text-cyan-700 capitalize px-4 py-1 rounded ${
        tag.name === searchTag && "bg-cyan-400 text-white font-medium"
      }`}
    >
      #{tag.name}
    </Link>
  );
}
