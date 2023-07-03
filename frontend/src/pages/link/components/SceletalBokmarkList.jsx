import { ChevronRightIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function SceletalBokmarkList() {
  return (
    <div className="flex flex-col">
      {[...Array(10).keys()].map((idx) => (
        <div className="flex items-center animate-pulse" key={idx}>
          <div className="flex flex-1 items-center gap-3">
            <div>
              <div className="w-8 h-8 rounded bg-gray-200"></div>
            </div>
            <div className="w-full py-2 space-y-2">
              <div className="bg-gray-900/10 dark:bg-white/10 rounded-lg h-4"></div>
              <div className="bg-gray-900/10 dark:bg-white/10 rounded-lg h-8"></div>
            </div>
          </div>
          <div>
            <ChevronRightIcon className="w-8 h-8 text-gray-900/10 dark:text-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
