import { createGlobalStore } from "../hooks/useGlobalStore";

const appMainStoreKeys = {
  AppName: "appName",
  IsErrored: "isErrored",
  IsLoading: "isLoading",
};

const appMainStoreInitialState = {
  appName: "NeonLink",
  isErrored: false,
  isLoading: true,
};

const [, , useAppMainStore] = createGlobalStore(appMainStoreInitialState);

export { appMainStoreKeys, appMainStoreInitialState, useAppMainStore };
