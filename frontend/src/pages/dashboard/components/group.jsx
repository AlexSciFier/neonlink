import React from "react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { pickColorBasedOnBgColor } from "../../../helpers/color";
import LazyIcon from "../../../components/LazyIcon";
import {
  useUserSettingsStore,
  userSettingsKeys,
} from "../../../stores/userSettingsStore";

export default function Group({ category, bookmarks = [], isLoading = false, onBookmarkDrop, onReorder, onSaveOrder }) {
  const [useImageAsBg] = useUserSettingsStore(
    userSettingsKeys.UseBackgroundgImage
  );
  const [cardHeaderStyle] = useUserSettingsStore(
    userSettingsKeys.CardHeaderStyle
  );
  const [useNeonShadow] = useUserSettingsStore(userSettingsKeys.UseNeonShadows);
  const [openLinkInNewTab] = useUserSettingsStore(
    userSettingsKeys.OpenLinkInNewTab
  );

  const [isDragOver, setIsDragOver] = useState(false);

  const draggedIdRef = useRef(null);

  let opacity = 0.8;
  let shadowOpacity = 0.5;
  let backgroundColor = category.color + opacityIntToHex(opacity);
  let shadowColor = category.color + opacityIntToHex(shadowOpacity);
  let foregroundColor = pickColorBasedOnBgColor(backgroundColor);

  let transparentHeader = cardHeaderStyle === "transparent";
  let borderless = cardHeaderStyle === "borderless";
  let solid = cardHeaderStyle === "solid";

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("bookmarkId", id);
    draggedIdRef.current = id;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const bookmarkId = Number(e.dataTransfer.getData("bookmarkId"));
    if (!bookmarkId) return;
    onBookmarkDrop(bookmarkId, category.id);
  };

  return (
    <div
      className={`w-full border rounded-lg overflow-hidden shadow-xl ${
        useImageAsBg
          ? solid
            ? "bg-white dark:bg-gray-800"
            : "backdrop-blur-lg bg-white/30 dark:bg-gray-900/30"
          : "bg-white dark:bg-transparent"
      } ${isDragOver ? "brightness-150" : ""}`}
      style={{
        borderColor: borderless ? "#00000000" : backgroundColor,
        boxShadow: useNeonShadow
          ? `0 20px 25px -5px ${shadowColor}, 0 8px 10px -6px ${shadowColor}`
          : "",
      }}
      onDragOver={handleDragOver}
      onDrop={(e) => { handleDrop(e); setIsDragOver(false); }}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsDragOver(false);
        }
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
        {isLoading ? (
          [...Array(3)].map((_, idx) => (
            <div key={idx} className="px-4 py-2 flex space-x-3">
              <div className="w-6 h-6 flex-none rounded-full dark:bg-white/10 bg-black/10 animate-pulse"></div>
              <div className="w-full rounded dark:bg-white/10 bg-black/10 animate-pulse"></div>
            </div>
          ))
        ) : bookmarks.length === 0 ? (
          <div className="text-center font-light dark:text-white">Empty</div>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              id={bookmark.id}
              className="bookmark group/bookmark"
              onDragStart={(e) => handleDragStart(e, bookmark.id)}
              onDragEnter={(e) => {
                e.preventDefault()
                const draggedId = draggedIdRef.current

                if(draggedId !== bookmark.id){
                  onReorder(draggedId, bookmark.id, category.id)
                }
              }}
              onDragEnd={() => onSaveOrder(category.id)}
              onDragOver={handleDragOver}
              draggable
            >
              <div className="dark:hover:bg-white/10 hover:bg-black/10 px-4 py-2 rounded flex items-center space-x-3 relative">
                <a
                  className="flex items-center space-x-3 flex-1 min-w-0"
                  href={bookmark.url}
                  target={openLinkInNewTab ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  draggable={false}
                  onClick={(e) => { e.currentTarget.style.pointerEvents = "auto"; }}
                >
                  <div className="flex-none relative">
                    <LazyIcon id={bookmark.id} title={bookmark.title} updatedAt={bookmark.updated_at} />
                  </div>
                  <div className="truncate dark:text-white">
                    {bookmark.title}
                  </div>
                </a>
                <Link
                  to={`/edit/${bookmark.id}`}
                  draggable={false}
                  className="flex-none opacity-0 group-hover/bookmark:opacity-100 transition-opacity text-gray-400 hover:text-cyan-500 dark:text-gray-500 dark:hover:text-cyan-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
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
