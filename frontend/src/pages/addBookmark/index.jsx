import React, { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { postJSON } from "../../helpers/fetch";
import InputBox from "./components/InputBox";
import { Navigate } from "react-router";
import TagInput from "./components/TagInput";
import { useCategoriesList } from "../../context/categoriesList";
import Page from "../../components/Page";
import { BUTTON_BASE_CLASS } from "../../helpers/baseDesign";

function LoadCircle() {
  return (
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
  );
}

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, url]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshHandler = (e) => {
    e.preventDefault();
    let url = urlRef.current.value;
    fetchUrl(url);
  };

  async function fetchUrl(url) {
    setUrlError(undefined);
    if (url === "") return;
    if (!/^https?:\/\//i.test(url)) {
      setUrl("https://" + url);
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
    let { name, value } = e.target;
    if (name === "categoryId") {
      value = Number(value);
    }
    setFormData({ ...formData, [name]: value });
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

  if (complete) {
    if (formData.categoryId === 0) return <Navigate to={"/links"} />;
    return <Navigate to={"/"} />;
  }

  return (
    <Page>
      <div className="flex justify-center w-full">
        <form
          className="md:w-1/2 px-3 w-full flex flex-col gap-3 my-3"
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
            autoFocus={true}
            required={true}
          ></InputBox>
          <input
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            type={"text"}
            placeholder="Title"
            name={"title"}
            value={formData.title}
            onChange={inputHandler}
            required={true}
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
            placeholder="Category"
            name={"categoryId"}
            onChange={inputHandler}
          >
            <option className="text-black" value={0}>
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
              className={BUTTON_BASE_CLASS + "flex gap-2 items-center"}
              type="submit"
              disabled={isButtonDisabled()}
            >
              {sending ? <LoadCircle /> : "Add"}
            </button>
          </div>
        </form>
      </div>
    </Page>
  );
}
