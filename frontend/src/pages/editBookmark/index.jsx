import React, { useEffect, useState } from "react";
import PageBody from "../../components/PageBody";
import NavBar from "../../components/NavBar";
import { getJSON, putJSON } from "../../helpers/fetch";
import { useParams } from "react-router";

export default function EditBookmark() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState();
  const [formData, setFormData] = useState({ title: "", desc: "", url: "" });

  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      let res = await getJSON(`/api/bookmarks/${id}`);
      if (res.ok) {
        let json = await res.json();
        setFormData({ url: json.url, title: json.title, desc: json.desc });
      }
    }
    fetchData();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(undefined);
    let res = await putJSON(`/api/bookmarks/${id}`, formData);
    setSending(false);
    if (res.ok) {
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
    <div>
      <NavBar />
      <PageBody>
        <div className="flex justify-center w-full">
          <form
            className="w-1/2 flex flex-col gap-3 my-3"
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
            <div className="flex justify-between">
              <div className="text-red-600">{error?.message || ""}</div>
              <button
                className="inline-flex items-center px-6 py-2 rounded focus:outline-none disabled:bg-gray-400 focus:ring-cyan-400 focus:ring hover:bg-cyan-400 bg-cyan-500 text-white"
                type="submit"
                disabled={isButtonDisabled()}
              >
                {sending ? (
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
                ) : (
                  "Edit"
                )}
              </button>
            </div>
          </form>
        </div>
      </PageBody>
    </div>
  );
}
