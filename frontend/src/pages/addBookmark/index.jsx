import React, { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { postJSON } from "../../helpers/fetch";
import InputBox from "./components/InputBox";
import { Navigate } from "react-router";
import TagInput from "./components/TagInput";
import { useCategoriesList } from "../../context/categoriesList";
import Page from "../../components/Page";

export default function AddPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    icon: "",
    categoryId: 0,
    tags: [],
  });
  const [url, setUrl] = useState("");
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState();
  const [urlError, setUrlError] = useState();

  const urlRef = useRef(null);

  let { categories, fetchCategories } = useCategoriesList();

  const debounced = useCallback(debounce(fetchUrl, 800), [url]);

  useEffect(() => {
    debounced(url);
    if (url === "")
      setFormData({
        ...formData,
        desc: "",
        title: "",
        icon: "",
      });
    return debounced.cancel;
  }, [debounced, url]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshHandler = (e) => {
    e.preventDefault();
    let url = urlRef.current.value;
    fetchUrl(url);
  };

  async function fetchUrl(url) {
    if (url === "") return;

    try {
      setUrlError(undefined);
      url = new URL(url).toString();
    } catch (error) {
      console.error(error.message);
      setUrlError(error.message);
      return;
    }

    setIsLoading(true);
    let res;
    try {
      setError(undefined);
      res = await postJSON("/api/utils/urlinfo", { url });
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }

    if (res.ok) {
      setFormData({ ...formData, ...(await res.json()), tags: formData.tags });
      setIsLoading(false);
    } else {
      console.error("error", res.statusText, res.status);
      setIsLoading(false);
    }
  }

  function inputHandler(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    let submitData = { ...formData, url: urlRef.current.value };
    let res;
    try {
      res = await postJSON("/api/bookmarks", submitData);
    } catch (error) {
      setError(error);
      setSending(false);
    }

    if (res.ok) {
      setComplete(true);
    } else {
      setError(await res.json());
      setSending(false);
    }
  };

  function isButtonDisabled() {
    return error || urlError || sending || isLoading || url === ""
      ? true
      : false;
  }

  if (complete) return <Navigate to={"/"} />;

  return (
    <Page>
      <div className="flex justify-center w-full">
        <form
          className="md:w-1/2 w-full flex flex-col gap-3 my-3"
          onSubmit={handleSubmit}
        >
          <InputBox
            type={"url"}
            name={"url"}
            placeholder="URL"
            onChange={(e) => setUrl(e.target.value)}
            refreshHandler={refreshHandler}
            value={url}
            icon={formData.icon}
            ref={urlRef}
            isLoading={isLoading}
          ></InputBox>
          <input
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            type={"text"}
            placeholder="Title"
            name={"title"}
            value={formData.title}
            onChange={inputHandler}
          ></input>
          <TagInput
            tags={formData.tags}
            setTags={(tags) => setFormData({ ...formData, tags })}
          />
          <textarea
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            type={"text"}
            placeholder="Description"
            name={"desc"}
            value={formData.desc}
            onChange={inputHandler}
          ></textarea>
          <select
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            type={""}
            placeholder="Title"
            name={"categoryId"}
            onChange={inputHandler}
          >
            <option className="text-black" value={undefined}>
              None
            </option>
            {categories.map((category) => (
              <option
                className="text-black"
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
          <div className="flex justify-between">
            <div className="text-red-600">
              {error?.message || urlError || ""}
            </div>
            <button
              className="inline-flex items-center px-6 py-2 rounded focus:outline-none disabled:bg-gray-400 focus:ring-cyan-400 focus:ring hover:bg-cyan-400 bg-cyan-500 text-white"
              type="submit"
              disabled={isButtonDisabled()}
            >
              {sending ? (
                <>
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending ...
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </form>
      </div>
    </Page>
  );
}
