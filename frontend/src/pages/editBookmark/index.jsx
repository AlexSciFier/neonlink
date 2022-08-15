import React, { useEffect, useState } from "react";
import { getJSON, putJSON } from "../../helpers/fetch";
import { useNavigate, useParams } from "react-router";
import Page from "../../components/Page";
import { useCategoriesList } from "../../context/categoriesList";
import TagInput from "../addBookmark/components/TagInput";
import { BUTTON_BASE_CLASS } from "../../helpers/baseDesign";
import IconInput from "./iconInput";

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
          stroke-width="4"
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
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    url: "",
    tags: [],
    icon: "",
    categoryId: 0,
  });

  const { id } = useParams();
  let { categories, fetchCategories } = useCategoriesList();
  let naviate = useNavigate();

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
        });
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(undefined);
    let res = await putJSON(`/api/bookmarks/${id}`, formData);
    setSending(false);
    if (res.ok) {
      naviate("/links");
    } else {
      let error = await res.json();
      setError(error);
    }
  }

  function inputHandler(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function isButtonDisabled() {
    return sending;
  }

  return (
    <Page>
      <div className="flex justify-center w-full">
        <form
          className="md:w-1/2 px-3 w-full flex flex-col gap-3 my-3"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full bg-transparent disabled:text-gray-400 rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2"
            type={"url"}
            placeholder="Url"
            name={"url"}
            value={formData.url}
            disabled={true}
          ></input>
          <IconInput
            icon={formData.icon}
            url={formData.url}
            setIcon={(icon) => setFormData({ ...formData, icon })}
          />
          <input
            className="w-full bg-transparent rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2"
            type={"text"}
            placeholder="Title"
            name={"title"}
            value={formData.title}
            onChange={inputHandler}
          ></input>
          <textarea
            className="w-full bg-transparent rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2"
            type={"text"}
            placeholder="Description"
            name={"desc"}
            value={formData.desc}
            onChange={inputHandler}
          ></textarea>
          <TagInput
            tags={formData.tags}
            setTags={(tags) => setFormData({ ...formData, tags })}
          />
          <select
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            type={""}
            placeholder="Title"
            name={"categoryId"}
            value={formData.categoryId}
            onChange={inputHandler}
          >
            <option className="text-black" value={0}>
              None
            </option>
            {categories.map((category) => (
              <option
                // selected={category.id === formData.categoryId}
                className="text-black"
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
              {sending ? <LoadCircle /> : "Edit"}
            </button>
          </div>
        </form>
      </div>
    </Page>
  );
}
