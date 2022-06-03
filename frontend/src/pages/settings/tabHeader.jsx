import React from "react";

export default function TabHeader({ title, isActive, onClick }) {
  return (
    <li
      className={`px-4 py-2 hover:bg-cyan-600/10 hover:cursor-pointer ${
        isActive ? "border-b-2 border-cyan-500" : ""
      }`}
      onClick={onClick}
    >
      {title}
    </li>
  );
}
