import React from "react";

export default function TagItem({ tag }) {
  return (
    <a
      href={`/group/${tag.id}`}
      className="hover:underline hover:text-cyan-700"
    >
      {tag.name}
    </a>
  );
}
