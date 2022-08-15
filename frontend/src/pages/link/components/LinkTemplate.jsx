import { ChevronRightIcon } from "@heroicons/react/outline";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useBookMarkList } from "../../../context/bookmarkList";
import { getDomain } from "../../../helpers/url";
import { prettyfyDate } from "../../../helpers/date";
import { Link } from "react-router-dom";
import { useInterfaceSettings } from "../../../context/interfaceSettingsContext";

function Options({ className, bookmarkId, setShowOptions }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { deleteBookmark } = useBookMarkList();

  function handleEdit(e) {
    navigate(`/edit/${bookmarkId}`);
  }

  async function handleDelete(e) {
    setIsDeleting(true);
    await deleteBookmark(bookmarkId);
    setShowOptions(false);
    setIsDeleting(false);
  }

  return (
    <div className={`flex h-full w-full ${className}`}>
      <button className="bg-cyan-500 px-3 text-white" onClick={handleEdit}>
        Edit
      </button>
      <button
        className="bg-red-500 px-3 disabled:bg-gray-500 disabled:animate-pulse text-white"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}

export default function LinkTemplate({ bookmark }) {
  const { openLinkInNewTab } = useInterfaceSettings();
  const [showOptions, setShowOptions] = useState(false);
  const optionBlock = useRef(null);

  return (
    <div
      className={`flex relative transition-transform py-1`}
      style={{
        transform: showOptions
          ? `translate3d(-${optionBlock.current.offsetWidth}px, 0,0)`
          : "",
      }}
    >
      <div className="flex-auto overflow-hidden flex justify-between items-center text-gray-400">
        <div className="flex flex-auto overflow-hidden gap-3">
          <div className="flex-none relative">
            <LazyIcon id={bookmark.id} title={bookmark.title} />
          </div>
          <div className="flex-auto truncate">
            <a
              href={bookmark.url}
              target={openLinkInNewTab ? "_blank" : "_self"}
              rel="noreferrer"
              className="text-lg text-cyan-700 hover:underline dark:text-cyan-300"
            >
              {bookmark.title}
              <span className="pl-3 font-light">{getDomain(bookmark.url)}</span>
            </a>
            <div className="font-light text-gray-700 dark:text-gray-200 truncate md:block hidden">
              {bookmark.desc}
            </div>
            <div className="flex justify-between md:flex-row text-sm flex-col">
              <div className="flex gap-3 font-light">
                {bookmark.tags?.map((tag, idx) => (
                  <Link
                    key={idx}
                    className="hover:underline"
                    to={`/links?tag=${tag}`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
              <div>{prettyfyDate(bookmark.created)}</div>
            </div>
          </div>
        </div>
        <button
          className="flex-none"
          onClick={(e) => setShowOptions(!showOptions)}
        >
          <ChevronRightIcon
            className={`w-8 h-8 ${showOptions && "rotate-180"}`}
          />
        </button>
      </div>
      <div
        ref={optionBlock}
        className="absolute translate-x-full-plus-one transform-gpu right-0 top-0 bottom-0 flex items-center text-gray-400"
      >
        <Options bookmarkId={bookmark.id} setShowOptions={setShowOptions} />
      </div>
    </div>
  );
}

function LazyIcon({ id, title }) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <>
      <img
        onLoad={() => setIsLoading(false)}
        className={`w-8 h-8 bg-contain bg-no-repeat bg-center transition-opacity ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        height={32}
        width={32}
        loading="lazy"
        alt={`icon for ${title}`}
        src={`${
          process.env.NODE_ENV !== "production" ? "http://localhost:3333" : ""
        }/api/bookmarks/${id}/icon`}
      ></img>
      <div
        className={`w-8 h-8 animate-pulse rounded bg-gray-200 absolute top-0 ${
          isLoading ? "" : "hidden"
        }`}
      ></div>
    </>
  );
}
