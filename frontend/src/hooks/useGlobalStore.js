import { useState, useEffect } from "react";

const createEmitter = () => {
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

export const createGlobalStore = (initialState) => {
  let globalState = initialState;
  const emitters = Object.fromEntries(
    Object.keys(initialState).map((key) => [key, createEmitter()])
  );

  const getGlobalState = (key) => globalState[key];

  const setGlobalState = (key, nextValue) => {
    const currentValue = getGlobalState(key);
    if (typeof nextValue === "function") {
      nextValue = nextValue(currentValue);
    }
    if (currentValue !== nextValue) {
      globalState = { ...globalState, [key]: nextValue };
      emitters[key].emit(nextValue);
    }
  };

  const useGlobalState = (key, dependencies) => {
    const [state, setState] = useState(getGlobalState(key));
    useEffect(() => emitters[key].subscribe(setState), dependencies || []);
    return [state, (nextValue) => setGlobalState(key, nextValue)];
  };

  return [getGlobalState, setGlobalState, useGlobalState];
};
