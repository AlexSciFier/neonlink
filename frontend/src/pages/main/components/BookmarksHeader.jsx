import React from "react";

export default function BookmarksHeader() {
  return (
    <div className="flex gap-3">
      <input
        className="py-2 px-4 flex-1 border rounded"
        type={"text"}
        placeholder={"Search"}
      ></input>
    </div>
  );
}
