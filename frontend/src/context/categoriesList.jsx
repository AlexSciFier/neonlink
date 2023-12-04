import React, { createContext, useContext, useRef, useState } from "react";
import { deleteJSON, getJSON, postJSON, putJSON } from "../helpers/fetch";

const CategoriesList = createContext();

export function useCategoriesList() {
  return useContext(CategoriesList);
}

export function CategoriesListProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const abortController = useRef(null);

  async function fetchCategories() {
    setError(undefined);
    setIsLoading(true);
    abortController.current = new AbortController();
    let res = await getJSON(`/api/categories`, abortController.current.signal);
    if (res.ok) {
      setCategories(await res.json());
    } else {
      setError(await res.json());
    }
    setIsLoading(false);
  }

  async function addCategory(name, color) {
    setError(undefined);
    // setIsLoading(true);
    abortController.current = new AbortController();
    let res = await postJSON(
      "api/categories",
      { name, color },
      abortController.current.signal
    );
    if (res.ok) {
      let id = await res.json();
      setCategories([...categories, { id, name, color }]);
    } else {
      setError(await res.json());
    }
    // setIsLoading(false);
  }
  /**
   *
   * @param {number} id id
   * @param {string} name name
   * @param {string} color color in HEX with #
   * @param {number} position position
   * @returns
   */
  async function editCategory(id, name, color, position) {
    setError(undefined);
    // setIsLoading(true);
    abortController.current = new AbortController();
    let res = await putJSON(
      `api/categories/${id}`,
      { name, color, position },
      abortController.current.signal
    );
    if (res.ok) {
      let idx = categories.findIndex((category) => category.id === id);
      let arrayCopy = [...categories];
      let itemCopy = { ...arrayCopy[idx] };
      itemCopy.name = name;
      itemCopy.color = color;
      itemCopy.position = position;
      arrayCopy[idx] = itemCopy;
      setCategories(arrayCopy);
      return true;
    } else {
      setError(await res.json());
      return false;
    }
    // setIsLoading(false);
  }

  async function deleteCategory(id) {
    setError(undefined);
    // setIsLoading(true);
    abortController.current = new AbortController();
    let res = await deleteJSON(
      `api/categories/${id}`,
      abortController.current.signal
    );
    if (res.ok) {
      let filtered = categories.filter((item) => item.id !== id);
      setCategories(filtered);
    } else {
      setError(await res.json());
    }
    // setIsLoading(false);
  }

  async function changePositions(idPositionPairArray) {
    setError(undefined);
    // setIsLoading(true);
    abortController.current = new AbortController();
    let res = await putJSON(
      `api/categories/changePositions`,
      idPositionPairArray,
      abortController.current.signal
    );
    if (res.ok) {
      // setCategories(re);
    } else {
      setError(await res.json());
    }
    // setIsLoading(false);
  }

  function abort() {
    abortController.current.abort();
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
        editCategory,
        setCategories,
        changePositions,
        abort,
      }}
    >
      {children}
    </CategoriesList.Provider>
  );
}
