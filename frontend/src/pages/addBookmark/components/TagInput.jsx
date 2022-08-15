import React, { useCallback, useEffect, useState } from "react";
import { getJSON, postJSON } from "../../../helpers/fetch";
import { debounce } from "lodash/debounce";

export default function TagInput({ tags, setTags }) {
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounced = useCallback(debounce(fetchUrl, 500), [tagInput]);

  async function fetchUrl() {
    if (tagInput === "") {
      setSuggestions([]);
      return;
    }
    let res = await getJSON("/api/tags/?q=" + tagInput);
    if (res.ok) {
      setSuggestions(await res.json());
    }
  }

  useEffect(() => {
    if (tagInput.endsWith(" ")) {
      if (tags.includes(tagInput) === false) {
        addTag(tagInput);
      }
    }
    debounced();
    return debounced.cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTags, tagInput, tags]);

  function addTag(textInput) {
    let tagString = textInput.trim();
    setTags([...tags, tagString]);
    let founded = suggestions.filter((tag) => tag.name === tagString);
    if (founded.length === 0) {
      postJSON(`/api/tags`, { name: tagString });
    }
    setTagInput("");
    setSuggestions([]);
  }

  function deleteTag(e, tag) {
    e.preventDefault();
    setTags(tags.filter((tagInList) => tagInList !== tag));
  }

  return (
    <div className="relative">
      <div className="flex items-center rounded border focus-within:ring-cyan-600 focus-within:ring bg-transparent dark:text-white">
        <div className="flex gap-2 px-2">
          {tags.map((tag, idx) => (
            <div
              className="inline-flex whitespace-nowrap pl-2 bg-cyan-700 text-white rounded"
              key={idx}
            >
              {tag}
              <button
                onClick={(e) => deleteTag(e, tag)}
                className="ml-1 px-1 hover:bg-white/10"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          className="w-full focus:outline-none py-2 bg-transparent dark:text-white"
          type={"text"}
          list={"tags"}
          placeholder="Tags"
          name={"tags"}
          value={tagInput}
          autoComplete="off"
          onChange={(e) => setTagInput(e.target.value)}
        ></input>
      </div>
      {tagInput && (
        <ul className="absolute bg-white text-black left-0 right-0 mt-1 py-1 rounded shadow dark:ring-1 dark:ring-white/10 dark:bg-gray-900 dark:text-white dark:shadow-cyan-500/20">
          <li
            className="px-4 hover:bg-cyan-500 cursor-pointer"
            onClick={() => {
              addTag(tagInput);
            }}
          >
            Create <strong>{tagInput}</strong> tag
          </li>
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              onClick={() => {
                addTag(suggestion.name);
              }}
              className="px-4 hover:bg-cyan-500 cursor-pointer"
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
