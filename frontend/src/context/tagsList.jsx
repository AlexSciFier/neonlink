import React, { createContext, useContext, useRef, useState } from "react";
import { getJSON } from "../helpers/fetch";

const TagsList = createContext();

export function useTagsList() {
  return useContext(TagsList);
}

export function TagsListProvider({ children }) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const abortController = useRef(null);

  async function fetchTags() {
    setError(undefined);
    setIsLoading(true);
    abortController.current = new AbortController();
    let res = await getJSON(`/api/tags/active`, abortController.current.signal);
    if (res.ok) {
      setTags(await res.json());
    } else {
      setError(await res.json());
    }
    setIsLoading(false);
  }
  function abort() {
    abortController.current.abort();
  }
  return (
    <TagsList.Provider value={{ tags, isLoading, error, fetchTags, abort }}>
      {children}
    </TagsList.Provider>
  );
}
