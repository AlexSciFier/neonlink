import React, { useState } from "react";

export default function LazyIcon({ id, title, updatedAt }) {
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NODE_ENV !== "production" ? "http://localhost:3333" : "";
  const version = updatedAt ? new Date(updatedAt).getTime() : "";
  return (
    <>
      <img
        onLoad={() => setIsLoading(false)}
        className={`w-8 h-8 bg-contain bg-no-repeat bg-center transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
        height={32}
        width={32}
        loading="lazy"
        alt={`icon for ${title}`}
        src={`${baseUrl}/api/bookmarks/${id}/icon?v=${version}`}
      ></img>
      <div
        className={`w-8 h-8 animate-pulse rounded bg-gray-200 absolute top-0 ${isLoading ? "" : "hidden"}`}
      ></div>
    </>
  );
}
