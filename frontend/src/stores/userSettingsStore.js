import { createGlobalStore } from "../hooks/useGlobalStore";
import { getUserCurrentStore, userCurrentKeys } from "./userCurrentStore";
import { getJSON } from "../helpers/fetch";

const userSettingsKeys = {
  SyncSettings: "syncSettings",
  LSTheme: "lSTheme",
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
  syncSettings: false,
  lSTheme: getPreferedScheme(),
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
  syncSettings: "sync-settings",
  lSTheme: "theme-mode",
  maxItemsInLinks: "max-items-in-list",
  openLinkInNewTab: "open-links-in-new-tab",
  useBgImage: "use-image-as-bg",
  bgUrl: "bg-url",
  cardHeaderStyle: "card-header-style",
  useNeonShadow: "useNeonShadow",
  columns: "columns",
  cardVerticalAligment: "card-vertical-aligment",
};

const [, setUserSettingsStore, useUserSettingsStore] = createGlobalStore(
  userSettingsInitialState,
  userSettingsBrowserStorageMap
);

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
  if (!getUserCurrentStore(userCurrentKeys.Authenticated)) return;

  const res = await getJSON("/api/settings/user", abortController?.signal);

  if (!abortController.signal.aborted && res.ok) {
    const json = await res.json();
    setUserSettingsStore(
      userSettingsKeys.maxNumberOfLinks,
      json.maxNumberOfLinks
    );
    setUserSettingsStore(userSettingsKeys.OpenLinkInNewTab, json.linkInNewTab);
    setUserSettingsStore(userSettingsKeys.UseBackgroundgImage, json.useBgImage);
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

export { userSettingsKeys, useUserSettingsStore, fetchUserSettings };

/*
const [theme, setTheme] = useState(lSTheme);

const rawSetTheme = (rawTheme) => {
  const root = window.document.documentElement;
  if (rawTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  setLSTheme(rawTheme);
};

if (initialTheme) {
  rawSetTheme(initialTheme);
}

useEffect(() => {
  rawSetTheme(theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [theme]);

*/
