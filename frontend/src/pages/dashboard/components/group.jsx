import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  defaultAnimateLayoutChanges,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { pickColorBasedOnBgColor } from "../../../helpers/color";
import LazyIcon from "../../../components/LazyIcon";
import {
  useUserSettingsStore,
  userSettingsKeys,
} from "../../../stores/userSettingsStore";

// Force layout changes to animate in BOTH directions (default skips items
// returning toward their origin, which makes reordering look one-directional).
const animateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function Group({
  category,
  bookmarks = [],
  isLoading = false,
  dropIndicator = null,
}) {
  const [useImageAsBg] = useUserSettingsStore(
    userSettingsKeys.UseBackgroundgImage
  );
  const [cardHeaderStyle] = useUserSettingsStore(
    userSettingsKeys.CardHeaderStyle
  );
  const [useNeonShadow] = useUserSettingsStore(userSettingsKeys.UseNeonShadows);
  const [dashboardEditMode] = useUserSettingsStore(
    userSettingsKeys.DashboardEditMode
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: "g" + category.id,
    data: { type: "group" },
    animateLayoutChanges,
    disabled: !dashboardEditMode,
  });

  const style = {
    transform: CSS.Transform.toString({ ...transform, scaleY: 1, scaleX: 1 }),
    transition,
  };

  let opacity = 0.8;
  let shadowOpacity = 0.5;
  let backgroundColor = category.color + opacityIntToHex(opacity);
  let shadowColor = category.color + opacityIntToHex(shadowOpacity);
  let foregroundColor = pickColorBasedOnBgColor(backgroundColor);

  let transparentHeader = cardHeaderStyle === "transparent";
  let borderless = cardHeaderStyle === "borderless";
  let solid = cardHeaderStyle === "solid";

  // Stable identity is REQUIRED: a fresh array each render makes dnd-kit think
  // the items changed every frame, which kills the settle-back transition and
  // makes reordering animate in only one direction.
  const bookmarkIds = useMemo(
    () => bookmarks.map((b) => "b" + b.id),
    [bookmarks]
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: borderless ? "#00000000" : backgroundColor,
        boxShadow: useNeonShadow
          ? `0 20px 25px -5px ${shadowColor}, 0 8px 10px -6px ${shadowColor}`
          : "",
      }}
      {...attributes}
      className={`relative w-full border rounded-lg overflow-hidden shadow-xl ${
        useImageAsBg
          ? solid
            ? "bg-white dark:bg-gray-800"
            : "backdrop-blur-lg bg-white/30 dark:bg-gray-900/30"
          : "bg-white dark:bg-transparent"
      } ${isDragging ? "opacity-50 z-50" : ""}`}
    >
      {dropIndicator ? (
        <div
          className={`pointer-events-none absolute inset-y-0 w-1.5 z-50 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 ${
            dropIndicator === "left" ? "left-0" : "right-0"
          }`}
        />
      ) : null}
      <div
        ref={dashboardEditMode ? setActivatorNodeRef : undefined}
        {...(dashboardEditMode ? listeners : {})}
        className={`group/header relative text-2xl font-light py-2 text-center dark:text-white select-none ${
          dashboardEditMode ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
        style={
          transparentHeader || borderless
            ? { backgroundColor: "#00000000" }
            : { backgroundColor, color: foregroundColor }
        }
      >
        {category.name}
        {dashboardEditMode && (
          <Link
            to={`/add?categoryId=${category.id}`}
            draggable={false}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            title="Add bookmark to this group"
            aria-label="Add bookmark to this group"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover/header:opacity-100 focus:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10"
          >
            <PlusIcon className="w-6 h-6" />
          </Link>
        )}
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
          <div className="text-center font-light dark:text-white py-2">
            Empty
          </div>
        ) : (
          <SortableContext
            items={bookmarkIds}
            strategy={verticalListSortingStrategy}
          >
            {bookmarks.map((bookmark) => (
              <SortableBookmark
                key={bookmark.id}
                bookmark={bookmark}
                categoryId={category.id}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

function SortableBookmark({ bookmark, categoryId }) {
  const [openLinkInNewTab] = useUserSettingsStore(
    userSettingsKeys.OpenLinkInNewTab
  );
  const [dashboardEditMode] = useUserSettingsStore(
    userSettingsKeys.DashboardEditMode
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: "b" + bookmark.id,
    data: { type: "bookmark", categoryId },
    animateLayoutChanges,
    disabled: !dashboardEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(dashboardEditMode ? listeners : {})}
      className={`bookmark group/bookmark select-none ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className={`dark:hover:bg-white/10 hover:bg-black/10 px-4 py-2 rounded flex items-center space-x-3 relative ${dashboardEditMode ? "cursor-grab active:cursor-grabbing" : ""}`}>
        <a
          className="flex items-center space-x-3 flex-1 min-w-0"
          href={bookmark.url}
          target={openLinkInNewTab ? "_blank" : "_self"}
          rel="noopener noreferrer"
          draggable={false}
        >
          <div className="flex-none relative">
            <LazyIcon
              id={bookmark.id}
              title={bookmark.title}
              updatedAt={bookmark.updated_at}
            />
          </div>
          <div className="truncate dark:text-white">{bookmark.title}</div>
        </a>
        {dashboardEditMode && (
          <Link
            to={`/edit/${bookmark.id}`}
            draggable={false}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-none opacity-0 group-hover/bookmark:opacity-100 transition-opacity text-gray-400 hover:text-cyan-500 dark:text-gray-500 dark:hover:text-cyan-400"
            onClick={(e) => e.stopPropagation()}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </Link>
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
