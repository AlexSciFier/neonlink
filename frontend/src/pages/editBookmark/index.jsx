import React, { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { getJSON, postJSON, putJSON } from "../../helpers/fetch";
import { useNavigate, useParams } from "react-router";
import Page from "../../components/Page";
import { useCategoriesList } from "../../context/categoriesList";
import TagInput from "../addBookmark/components/TagInput";
import { BUTTON_BASE_CLASS } from "../../helpers/baseDesign";
import IconInput from "./iconInput";
import { notify } from "../../components/Notification";
import { resetBookmarksCache } from "../../helpers/bookmarkService";

function LoadCircle() {
  return (
    <>
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Sending ...
    </>
  );
}

export default function EditBookmark() {
  const [sending, setSending] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    url: "",
    tags: [],
    icon: "",
    categoryId: 0,
    updatedAt: "",
  });

  const { id } = useParams();
  let { categories, fetchCategories } = useCategoriesList();
  let navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      let res = await getJSON(`/api/bookmarks/${id}`);
      if (res.ok) {
        let json = await res.json();
        setFormData({
          url: json.url,
          title: json.title,
          desc: json.desc,
          tags: json.tags?.split(",") ?? [],
          icon: json.icon,
          categoryId: json.categoryId,
          updatedAt: json.updated_at,
        });
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (error) notify("Error", error?.message || "Cannot edit url", "error");
  }, [error]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUrlInfo(url) {
    if (!url || !url.startsWith("http")) return;
    setIsFetching(true);
    try {
      const res = await postJSON("/api/utils/urlinfo", { url });
      if (res.ok) {
        const info = await res.json();
        setFormData((prev) => ({
          ...prev,
          title: info.title ?? prev.title,
          desc: info.desc ?? prev.desc,
          icon: info.icon ?? prev.icon,
          url,
        }));
      }
    } catch (e) {
      // ignore fetch errors for metadata
    } finally {
      setIsFetching(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce(fetchUrlInfo, 800), []);

  function inputHandler(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "url") {
      debouncedFetch(value);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(undefined);
    let res = await putJSON(`/api/bookmarks/${id}`, formData);
    setSending(false);
    if (res.ok) {
      resetBookmarksCache();
      navigate(-1);
    } else {
      let error = await res.json();
      setError(error);
    }
  }

  function isButtonDisabled() {
    return sending || isFetching;
  }

  return (
    <Page>
      <div className="flex justify-center w-full">
        <form
          className="md:w-1/2 px-3 w-full flex flex-col gap-3 my-3"
          onSubmit={handleSubmit}
        >
          <div className="relative">
            <input
              className="w-full bg-transparent rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 dark:text-white"
              type="url"
              placeholder="Url"
              name="url"
              value={formData.url}
              onChange={inputHandler}
            />
            {isFetching && (
              <svg
                className="animate-spin absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
          <IconInput
            icon={formData.icon}
            url={formData.url}
            setIcon={(icon) => setFormData((prev) => ({ ...prev, icon }))}
            updatedAt={formData.updatedAt}
          />
          <input
            className="w-full bg-transparent rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 dark:text-white"
            type="text"
            placeholder="Title"
            name="title"
            value={formData.title}
            onChange={inputHandler}
          />
          <textarea
            className="w-full bg-transparent rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 dark:text-white"
            placeholder="Description"
            name="desc"
            value={formData.desc}
            onChange={inputHandler}
          />
          <TagInput
            tags={formData.tags}
            setTags={(tags) => setFormData((prev) => ({ ...prev, tags }))}
          />
          <select
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            name="categoryId"
            value={formData.categoryId}
            onChange={inputHandler}
          >
            <option className="text-black dark:bg-gray-900 dark:text-white" value={0}>
              None
            </option>
            {categories.map((category) => (
              <option
                className="dark:bg-gray-900 dark:text-white"
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
          <div className="flex justify-between">
            <div className="text-red-600">{error?.message || ""}</div>
            <button
              className={BUTTON_BASE_CLASS + "flex items-center"}
              type="submit"
              disabled={isButtonDisabled()}
            >
              {sending ? <LoadCircle /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </Page>
  );
}
