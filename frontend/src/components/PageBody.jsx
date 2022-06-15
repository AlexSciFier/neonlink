import React from "react";

export default function PageBody({ children }) {
  return (
    <div className="flex gap-3 rounded-xl h-full md:p-4 mx-3 dark:bg-gray-900 bg-white dark:text-white flex-1">
      {children}
    </div>
  );
}
