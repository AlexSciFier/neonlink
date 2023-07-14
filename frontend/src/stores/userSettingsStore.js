import { createGlobalStore } from "../hooks/useGlobalStore";
import { getUserCurrentStore, userCurrentKeys } from "./userCurrentStore";
import { getJSON } from "../helpers/fetch";
import { appSettingsKeys, getAppSettingsStore } from "./appSettingsStore";

const userSettingsKeys = {
  Theme: "theme",
  MaxItemsInLinks: "maxItemsInLinks",
  OpenLinkInNewTab: "openLinkInNewTab",
  UseBackgroundgImage: "useBgImage",
  BackgroundImage: "bgUrl",
  Columns: "columns",
  CardHeaderStyle: "cardHeaderStyle",
  UseNeonShadows: "useNeonShadows",
  CardVerticalAligment: "cardVerticalAligment",
};

const userSettingsInitialState = {
  theme: getPreferedScheme(),
  maxItemsInLinks: 50,
  openLinkInNewTab: true,
  useBgImage: false,
  bgUrl: "",
  columns: 20,
  cardHeaderStyle: "default",
  useNeonShadows: false,
  cardVerticalAligment: "top",
};

const userSettingsBrowserStorageMap = {
  theme: "theme-mode",
  maxItemsInLinks: "max-items-in-list",
  openLinkInNewTab: "open-links-in-new-tab",
  useBgImage: "use-image-as-bg",
  bgUrl: "bg-url",
  cardHeaderStyle: "card-header-style",
  useNeonShadow: "useNeonShadow",
  columns: "columns",
  cardVerticalAligment: "card-vertical-aligment",
};

const [getUserSettingsStore, setUserSettingsStore, useUserSettingsStore] =
  createGlobalStore(userSettingsInitialState, userSettingsBrowserStorageMap);

function getPreferedScheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

async function fetchUserSettings(abortController) {
  const authenticationEnabled = getAppSettingsStore(
    appSettingsKeys.AuthenticationEnabled
  );
  const authenticated = getUserCurrentStore(userCurrentKeys.Authenticated);
  if (!authenticationEnabled || !authenticated) return;

  const res = await getJSON("/api/settings/user", abortController?.signal);

  if (abortController?.signal?.aborted !== true && res.ok) {
    const json = await res.json();
    setUserSettingsStore(
      userSettingsKeys.MaxItemsInLinks,
      json.maxNumberOfLinks
    );
    setUserSettingsStore(userSettingsKeys.OpenLinkInNewTab, json.linkInNewTab);
    setUserSettingsStore(userSettingsKeys.UseBackgroundgImage, json.useBgImage);
    setUserSettingsStore(userSettingsKeys.BackgroundImage, json.bgImage);
    setUserSettingsStore(userSettingsKeys.Columns, json.columns);
    setUserSettingsStore(userSettingsKeys.CardHeaderStyle, json.cardStyle);
    setUserSettingsStore(
      userSettingsKeys.UseNeonShadows,
      json.enableNeonShadows
    );
    setUserSettingsStore(
      userSettingsKeys.CardVerticalAligment,
      json.cardPosition
    );
  }
}

export {
  userSettingsKeys,
  userSettingsInitialState,
  getUserSettingsStore,
  setUserSettingsStore,
  useUserSettingsStore,
  fetchUserSettings,
};
