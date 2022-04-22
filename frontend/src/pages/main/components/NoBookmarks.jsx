import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/outline";

export default function NoBookmarks() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-gray-500 text-xl text-center">No bookmarks</div>
      <Link
        to={"/add"}
        className="bg-cyan-500 text-white w-fit px-4 py-2 h-full rounded flex items-center gap-1"
      >
        <PlusIcon className="w-6 h-6" />
        <span className="hidden md:inline">Add bookmark</span>
      </Link>
    </div>
  );
}
