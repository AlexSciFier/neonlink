import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useTheme } from "../../../context/themeContext";
import { pickColorBasedOnBgColor } from "../../../helpers/color";
import { getJSON } from "../../../helpers/fetch";

export default function Group({ category }) {
  const { useImageAsBg } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  let opacity = "cc";
  let backgroundColor = category.color + opacity;
  let foregroundColor = pickColorBasedOnBgColor(backgroundColor);

  useEffect(() => {
    const fetch = async () => {
      let res = await getJSON("/api/bookmarks/category/" + category.id);
      if (res.ok) {
        setBookmarks(await res.json());
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div
      className={`w-full border rounded-lg ${
        useImageAsBg ? "backdrop-blur-lg" : "bg-transparent"
      }`}
      style={{ borderColor: backgroundColor }}
    >
      <div
        className="text-3xl py-2 rounded-t text-center"
        style={{ backgroundColor, color: foregroundColor }}
      >
        {category.name}
      </div>
      <div className="flex flex-col space-y-1 my-3 mx-3">
        {bookmarks.length === 0 && (
          <div className="text-center font-light dark:text-white">Empty</div>
        )}
        {isLoading === true ||
          bookmarks.map((bookmark) => (
            <a
              className="dark:hover:bg-white/10 hover:bg-black/10 px-4 py-2 rounded flex space-x-3"
              key={bookmark.id}
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                className="w-6 h-6 flex-none"
                style={{
                  backgroundImage: `url(${bookmark.icon})`,
                  backgroundSize: "cover",
                }}
              ></div>
              <div className="truncate w-full dark:text-white">
                {bookmark.title}
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}
