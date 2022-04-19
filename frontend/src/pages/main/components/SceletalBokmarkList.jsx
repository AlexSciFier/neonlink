import React from "react";

export default function SceletalBokmarkList() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(10).keys()].map((idx) => (
        <div className="w-full animate-pulse space-y-2" key={idx}>
          <div className="bg-gray-200 rounded-lg h-4"></div>
          <div className="bg-gray-200 rounded-lg h-8"></div>
        </div>
      ))}
    </div>
  );
}
