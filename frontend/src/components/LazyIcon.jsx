import React, { useState } from "react";

export default function LazyIcon({ id, title }) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <>
      <img
        onLoad={() => setIsLoading(false)}
        className={`w-8 h-8 bg-contain bg-no-repeat bg-center transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
        height={32}
        width={32}
        loading="lazy"
        alt={`icon for ${title}`}
        src={`${process.env.NODE_ENV !== "production" ? "http://localhost:3333" : ""}/api/bookmarks/${id}/icon`}
      ></img>
      <div
        className={`w-8 h-8 animate-pulse rounded bg-gray-200 absolute top-0 ${isLoading ? "" : "hidden"}`}
      ></div>
    </>
  );
}
