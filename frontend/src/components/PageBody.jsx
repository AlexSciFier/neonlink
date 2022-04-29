import React from "react";

export default function PageBody({ children }) {
  return (
    <div className="bg-white flex gap-3 mx-3 mb-3 rounded-xl h-full p-4 dark:bg-black/30 dark:backdrop-blur-xl">
      {children}
    </div>
  );
}
