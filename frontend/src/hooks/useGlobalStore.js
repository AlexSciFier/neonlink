import { useState, useEffect } from "react";

const createEmitter = (key) => {
  const subscriptions = new Map();
  return {
    emit: (v) => subscriptions.forEach((fn) => fn(v)),
    subscribe: (fn) => {
      const key = Symbol();
      subscriptions.set(key, fn);
      return () => subscriptions.delete(key);
    },
  };
};

export const createGlobalStore = (initialState, browserStorageMapOrFunc) => {
  const browserStorageResolver = (key) => {
    if (browserStorageMapOrFunc && typeof window !== "undefined") {
      if (typeof browserStorageMapOrFunc === "function") {
        return browserStorageMapOrFunc(key);
      } else if (typeof browserStorageMapOrFunc === "object") {
        return browserStorageMapOrFunc[key];
      }
    }
    return undefined;
  };

  const initState = (key) => {
    const browserStorageKey = browserStorageResolver(key);
    if (browserStorageKey) {
      try {
        const item = window.localStorage.getItem(browserStorageKey);
        if (item) return JSON.parse(item);
      } catch (error) {
        //TODO: what to do of the error ?
      }
    }
    return initialState[key];
  };

  let globalState = Object.fromEntries(
    Object.keys(initialState).foreach((key) => [key, initState(key)])
  );

  const emitters = Object.fromEntries(
    Object.keys(initialState).map((key) => [key, createEmitter(key)])
  );

  const getGlobalState = (key) => globalState[key];

  const setGlobalState = (key, nextValue) => {
    const currentValue = getGlobalState(key);
    if (typeof nextValue === "function") {
      nextValue = nextValue(currentValue);
    }
    if (currentValue !== nextValue) {
      const browserStorageKey = browserStorageResolver(key);
      if (browserStorageKey) {
        try {
          window.localStorage.setItem(
            browserStorageKey,
            JSON.stringify(nextValue)
          );
        } catch (error) {
          //TODO: what to do of the error ?
        }
      }
      globalState = { ...globalState, [key]: nextValue };
      emitters[key].emit(nextValue);
    }
  };

  const useGlobalState = (key) => {
    const [state, setState] = useState(getGlobalState(key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => emitters[key].subscribe(setState));
    return [state, (nextValue) => setGlobalState(key, nextValue)];
  };

  return [getGlobalState, setGlobalState, useGlobalState];
};
