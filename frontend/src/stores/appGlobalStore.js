import { createGlobalStore } from "../hooks/useGlobalStore";

const appGlobalStoreKeys = {
  IsLoading: "isLoading",
};

const [, , useAppGlobalStore] = createGlobalStore({
  isLoading: true,
});

export { appGlobalStoreKeys, useAppGlobalStore };
