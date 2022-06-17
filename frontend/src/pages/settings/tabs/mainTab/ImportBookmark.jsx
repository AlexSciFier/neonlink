import React from "react";
import { useNavigate } from "react-router-dom";
import { UploadIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { postFormData, postJSON } from "../../../../helpers/fetch";
import { useEffect } from "react";
import BookmarkList from "./BookmarkList";

export default function ImportBookmark() {
  const [file, setFile] = useState();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyFile, setIsEmptyFile] = useState(true);
  const [urlList, setUrlList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    setIsEmptyFile(file?.name === undefined);
  }, [file]);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    let res = await postFormData("/api/utils/parseBookmarkFile", { file });
    if (res.ok) {
      console.log(res.statusText);
      setIsLoading(false);
      let list = await res.json();
      list = list.map((item, idx) => ({ ...item, id: idx, isSelected: true }));
      setUrlList(list);
    } else {
      console.error(res.statusText);
      setIsLoading(false);
      setError((await res.json()).message);
    }
  }

  async function handleImport() {
    let selectedItems = urlList.filter((item) => item.isSelected === true);
    let res = await postJSON(
      "/api/bookmarks/addArray",
      selectedItems.map((item) => ({
        url: item.href,
        title: item.name,
        icon: item.icon,
      }))
    );
    if (res.ok) {
      navigate("/links");
    } else {
      setError((await res.json()).message);
    }
  }

  return (
    <div>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <p>Import bookmarks from your browser using Netscape HTML format</p>
        <div className="flex">
          <label className="cursor-pointer flex-1">
            <div className="dark:text-white px-4 py-2 border rounded-l hover:bg-black/10 dark:hover:bg-cyan-400/10 flex">
              <span>{file?.name || "Open file..."}</span>
            </div>
            <input
              className="hidden"
              type={"file"}
              accept="text/html"
              onChange={(e) => setFile(e.target.files[0])}
            ></input>
          </label>
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 rounded-r flex gap-1 items-center disabled:bg-gray-500"
            disabled={isLoading || isEmptyFile}
          >
            <UploadIcon className="w-5 h-5" />
            <div className="hidden md:block">
              {isLoading ? "Uploading ..." : "Upload"}
            </div>
          </button>
        </div>
        <div className="text-red-500">{error}</div>
      </form>
      {urlList.length > 0 && (
        <BookmarkList
          items={urlList}
          setItems={setUrlList}
          onImportClick={handleImport}
        />
      )}
    </div>
  );
}
