import React from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function TagItem({ tag }) {
  const [searchParams, setSearchParams] = useSearchParams();
  let searchTag = searchParams.get("tag");
  return (
    <Link
      to={`/links?tag=${tag.name}`}
      className={`hover:underline hover:text-cyan-700 capitalize ${
        tag.name === searchTag && "text-cyan-500 font-medium"
      }`}
    >
      #{tag.name}
    </Link>
  );
}
