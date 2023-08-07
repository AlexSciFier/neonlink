import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { pickColorBasedOnBgColor } from "../../../helpers/color";
import { getJSON } from "../../../helpers/fetch";
import LazyIcon from "../../../components/LazyIcon";
import {
  useUserSettingsStore,
  userSettingsKeys,
} from "../../../stores/userSettingsStore";

export default function Group({ category }) {
  const [useImageAsBg] = useUserSettingsStore(
    userSettingsKeys.UseBackgroundgImage
  );
  const [cardHeaderStyle] = useUserSettingsStore(
    userSettingsKeys.CardHeaderStyle
  );
  const [useNeonShadow] = useUserSettingsStore(userSettingsKeys.UseNeonShadows);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  let opacity = 0.8;
  let shadowOpacity = 0.5;
  let backgroundColor = category.color + opacityIntToHex(opacity);
  let shadowColor = category.color + opacityIntToHex(shadowOpacity);
  let foregroundColor = pickColorBasedOnBgColor(backgroundColor);

  let transparentHeader = cardHeaderStyle === "transparent";
  let borderless = cardHeaderStyle === "borderless";
  let solid = cardHeaderStyle === "solid";

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
  }, [category.id]);

  return (
    <div
      className={`w-full border rounded-lg overflow-hidden shadow-xl ${
        useImageAsBg
          ? solid
            ? "bg-white dark:bg-gray-800"
            : "backdrop-blur-lg bg-white/30 dark:bg-gray-900/30"
          : "bg-white dark:bg-transparent"
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
          [...Array(3)].map((value, idx) => (
            <div key={idx} className="px-4 py-2 flex space-x-3">
              <div className="w-6 h-6 flex-none rounded-full dark:bg-white/10 bg-black/10 animate-pulse"></div>
              <div className="w-full rounded dark:bg-white/10 bg-black/10 animate-pulse"></div>
            </div>
          ))
        ) : bookmarks.length === 0 ? (
          <div className="text-center font-light dark:text-white">Empty</div>
        ) : (
          bookmarks.map((bookmark) => (
            <a
              className="dark:hover:bg-white/10 hover:bg-black/10 px-4 py-2 rounded flex items-center space-x-3"
              key={bookmark.id}
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex-none relative">
                <LazyIcon id={bookmark.id} title={bookmark.title} />
              </div>
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
