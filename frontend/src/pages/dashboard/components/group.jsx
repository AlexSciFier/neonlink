import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useInterfaceSettings } from "../../../context/interfaceSettingsContext";
import { pickColorBasedOnBgColor } from "../../../helpers/color";
import { getJSON } from "../../../helpers/fetch";

export default function Group({ category }) {
  const { useImageAsBg, cardHeaderStyle, useNeonShadow } =
    useInterfaceSettings();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  let opacity = 0.8;
  let shadowOpacity = 0.5;
  let backgroundColor = category.color + opacityIntToHex(opacity);
  let shadowColor = category.color + opacityIntToHex(shadowOpacity);
  let foregroundColor = pickColorBasedOnBgColor(backgroundColor);

  let transparentHeader = cardHeaderStyle === "transparent";
  let borderless = cardHeaderStyle === "borderless";

  useEffect(() => {
    setIsLoading(true);
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
      className={`w-full border rounded-lg overflow-hidden shadow-xl ${
        useImageAsBg ? "backdrop-blur-lg" : "bg-white dark:bg-transparent"
      }`}
      style={{
        borderColor: borderless ? "#00000000" : backgroundColor,
        boxShadow: useNeonShadow
          ? `0 20px 25px -5px ${shadowColor}, 0 8px 10px -6px ${shadowColor}`
          : "",
      }}
    >
      <div
        className="text-2xl font-light py-2 text-center dark:text-white"
        style={
          transparentHeader || borderless
            ? { backgroundColor: "#00000000" }
            : { backgroundColor, color: foregroundColor }
        }
      >
        {category.name}
      </div>
      <div className="flex flex-col space-y-1 my-3 mx-3">
        {isLoading === true ? (
          [...Array(3)].map((i) => (
            <div className="px-4 py-2 flex space-x-3">
              <div className="w-6 h-6 flex-none rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-full rounded bg-gray-200 animate-pulse"></div>
            </div>
          ))
        ) : bookmarks.length === 0 ? (
          <div className="text-center font-light dark:text-white">Empty</div>
        ) : (
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
          ))
        )}
      </div>
    </div>
  );
}

function opacityIntToHex(opacity) {
  return Math.floor(opacity >= 1.0 ? 255 : opacity * 256)
    .toString(16)
    .padStart(2, "0");
}
