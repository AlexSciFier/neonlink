import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useBookMarkList } from "../../../context/bookmarkList";
import { getDomain } from "../../../helpers/url";
import { prettyfyDate } from "../../../helpers/date";
import { Link } from "react-router-dom";

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
          <div className="flex-none">
            <div
              className="w-8 h-8 bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: `${
                  bookmark.icon ? `url(${bookmark.icon})` : ""
                }`,
              }}
            ></div>
          </div>
          <div className="flex-auto overflow-hidden">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noreferrer"
              className="text-lg text-cyan-700 truncate hover:underline dark:text-cyan-300"
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
          {showOptions ? (
            <ChevronLeftIcon className="w-8 h-8" />
          ) : (
            <ChevronRightIcon className="w-8 h-8" />
          )}
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
