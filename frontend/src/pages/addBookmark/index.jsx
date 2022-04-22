import React, { useCallback, useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import PageBody from "../../components/PageBody";
import { debounce } from "lodash";
import { getJSON, postJSON } from "../../helpers/fetch";
import InputBox from "./components/InputBox";
import { parseHtml } from "../../helpers/htmlParser";
import { Navigate, useParams } from "react-router";

export default function AddPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ title: "", desc: "", icon: "" });
  const [url, setUrl] = useState("");
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState();
  const [urlError, setUrlError] = useState();

  const { id } = useParams();

  const urlRef = useRef(null);

  const debounced = useCallback(debounce(fetchUrl, 800), [url]);

  useEffect(() => {
    async function fetchBookamrks() {
      if (id) {
        let res = await getJSON(`http://localhost:3333/api/bookmarks/${id}`);
        if (res.ok) {
          let data = await res.json();
          setFormData({ title: data.title, desc: data.desc, icon: data.icon });
          // setUrl(data.url);
        }
      }
    }
    fetchBookamrks();
  }, [id]);

  useEffect(() => {
    debounced(url);
    if (url === "") setFormData({ desc: "", title: "", icon: "" });
    return debounced.cancel;
  }, [debounced, url]);

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
      res = await postJSON("http://localhost:3333/api/utils/urlinfo", { url });
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }

    if (res.ok) {
      setFormData(await res.json());
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
      res = await postJSON("http://localhost:3333/api/bookmarks", submitData);
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
    <div>
      <NavBar />
      <PageBody>
        <div className="flex justify-center w-full">
          <form
            className="w-1/2 flex flex-col gap-3 my-3"
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
              className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2"
              type={"text"}
              placeholder="Title"
              name={"title"}
              value={formData.title}
              onChange={inputHandler}
            ></input>
            <textarea
              className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2"
              type={"text"}
              placeholder="Description"
              name={"desc"}
              value={formData.desc}
              onChange={inputHandler}
            ></textarea>
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
      </PageBody>
    </div>
  );
}
