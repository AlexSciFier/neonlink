import React, { createContext, useContext, useState } from "react";
import { deleteJSON, getJSON } from "../helpers/fetch";

const TagsList = createContext();

export function useTagsList() {
  return useContext(TagsList);
}

export function TagsListProvider({ children }) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  async function fetchTags() {
    setError(undefined);
    setIsLoading(true);
    let res = await getJSON(`/api/tags`);
    if (res.ok) {
      setTags(await res.json());
    } else {
      setError(await res.json());
    }
    setIsLoading(false);
  }

  return (
    <TagsList.Provider value={{ tags, isLoading, error, fetchTags }}>
      {children}
    </TagsList.Provider>
  );
}
