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

const [getAppMainStore, setAppMainStore, useAppMainStore] = createGlobalStore(
  appMainStoreInitialState
);

export {
  appMainStoreKeys,
  appMainStoreInitialState,
  getAppMainStore,
  setAppMainStore,
  useAppMainStore,
};
