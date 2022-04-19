import React from "react";

export default function LinkTemplate({ bookmark }) {
  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 items-center group"
    >
      <div>
        <div
          className="w-8 h-8 bg-contain bg-no-repeat bg-center"
          style={{
            backgroundImage: `${bookmark.icon ? `url(${bookmark.icon})` : ""}`,
          }}
        ></div>
      </div>
      <div>
        <div className="text-lg text-cyan-700 group-hover:underline">
          {bookmark.title}
        </div>
        <div className="font-light text-gray-700">{bookmark.desc}</div>
      </div>
    </a>
  );
}
