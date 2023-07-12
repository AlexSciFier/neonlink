import { createGlobalStore } from "../hooks/useGlobalStore";

const appMainStoreKeys = {
  AppName: "appName",
  IsErrored: false,
  IsLoading: "isLoading",
};

const appMainStoreInitialState = {
  appName: "NeonLink",
  isErrored: false,
  isLoading: true,
};

const [, , useAppMainStore] = createGlobalStore(appMainStoreInitialState);

export { appMainStoreKeys, appMainStoreInitialState, useAppMainStore };
