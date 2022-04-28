import React from "react";

export default function TagItem({ tag }) {
  return (
    <a href={`/tag/${tag.id}`} className="hover:underline hover:text-cyan-700">
      #{tag.name}
    </a>
  );
}
