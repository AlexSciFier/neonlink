import React, { createContext, useContext, useState } from "react";
import { deleteJSON, getJSON, postJSON } from "../helpers/fetch";

const CategoriesList = createContext();

export function useCategoriesList() {
  return useContext(CategoriesList);
}

export function CategoriesListProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  async function fetchCategories() {
    setError(undefined);
    setIsLoading(true);
    let res = await getJSON(`/api/categories`);
    if (res.ok) {
      setCategories(await res.json());
    } else {
      setError(await res.json());
    }
    setIsLoading(false);
  }

  async function addCategory(name, color) {
    setError(undefined);
    setIsLoading(true);
    let res = await postJSON("api/categories", { name, color });
    if (res.ok) {
      let id = await res.json();
      setCategories([...categories, { id, name, color }]);
    } else {
      setError(await res.json());
    }
    setIsLoading(false);
  }

  async function deleteCategory(id) {
    setError(undefined);
    setIsLoading(true);
    let res = await deleteJSON(`api/categories/${id}`);
    if (res.ok) {
      let filtered = categories.filter((item) => item.id !== id);
      setCategories(filtered);
    } else {
      setError(await res.json());
    }
    setIsLoading(false);
  }

  return (
    <CategoriesList.Provider
      value={{
        categories,
        isLoading,
        error,
        fetchCategories,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesList.Provider>
  );
}
