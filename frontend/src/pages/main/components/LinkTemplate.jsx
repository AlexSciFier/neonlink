import React from "react";

export default function LinkTemplate({ bookmark }) {
  return (
    <a href={bookmark.url} className="flex gap-3 items-center hover:underline">
      <div>
        <div
          className="w-8 h-8 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `${bookmark.icon ? `url(${bookmark.icon})` : ""}`,
          }}
        ></div>
      </div>
      <div>
        <div className="text-lg text-cyan-700">{bookmark.title}</div>
        <div className="font-light text-gray-700">{bookmark.desc}</div>
      </div>
    </a>
  );
}
