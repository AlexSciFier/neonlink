import React from "react";
import { Link } from "react-router-dom";

export default function TagItem({ tag }) {
  return (
    <Link
      to={`/?tag=${tag.name}`}
      className="hover:underline hover:text-cyan-700"
    >
      #{tag.name}
    </Link>
  );
}
