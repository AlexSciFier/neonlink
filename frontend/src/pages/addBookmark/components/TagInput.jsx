import React, { useCallback, useEffect, useState } from "react";
import { getJSON, postJSON } from "../../../helpers/fetch";
import { debounce } from "lodash";

export default function TagInput({ tags, setTags }) {
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const debounced = useCallback(debounce(fetchUrl, 800), [tagInput]);

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
      setTagInput("");
      if (tags.includes(tagInput) === false) {
        let tagString = tagInput.trim();
        setTags([...tags, tagString]);
        let founded = suggestions.filter((tag) => tag.name === tagString);
        if (founded.length === 0) {
          postJSON(`/api/tags`, { name: tagString });
        }
      }
    }
    debounced();
    return debounced.cancel;
  }, [setTags, tagInput, tags]);

  function deleteTag(e, tag) {
    e.preventDefault();
    setTags(tags.filter((tagInList) => tagInList !== tag));
  }

  return (
    <div className="flex items-center rounded border focus-within:ring-cyan-600 focus-within:ring">
      <div className="flex gap-2 px-2">
        {tags.map((tag, idx) => (
          <div
            className="inline-flex whitespace-nowrap px-2 bg-cyan-700 text-white rounded"
            key={idx}
          >
            {tag}
            <button onClick={(e) => deleteTag(e, tag)} className="pl-2">
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        className="w-full focus:outline-none py-2"
        type={"text"}
        list={"tags"}
        placeholder="Tags"
        name={"tags"}
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
      ></input>
      <datalist id="tags">
        {suggestions.map((suggestion, idx) => (
          <option key={idx} value={suggestion.name} />
        ))}
      </datalist>
    </div>
  );
}
