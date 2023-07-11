import React, { useContext, useState, useEffect, useRef } from "react";
import {
  CARD_HEADER_STYLE,
  CARD_VERTICAL_ALIGMENT,
  DEF_COLUMNS,
  DEF_MAX_ITEMS,
  DEF_OPEN_LINK_IN_NEW_TAB,
  DEF_USE_NEON_SHADOW,
} from "../../helpers/constants";
import { postJSON } from "../../helpers/fetch";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useIsloggedIn } from "../isLoggedIn";

function getPreferedScheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

const UserSettingsContext = React.createContext();

export function useUserSettings() {
  return useContext(UserSettingsContext);
}

export const UserSettingsProvider = ({ initialTheme, children }) => {
  const { profile } = useIsloggedIn();

  const [lSTheme, setLSTheme] = useLocalStorage(
    "theme-mode",
    getPreferedScheme()
  );

  const [syncSettings, setSyncSettings] = useLocalStorage(
    "sync-settings",
    false
  );

  const [theme, setTheme] = useState(lSTheme);

  const abortController = useRef(null);

  const [useImageAsBg, setUseImageAsBg] = useLocalStorage(
    "use-image-as-bg",
    profile?.useBgImage || false
  );
  const [bgUrl, setBgUrl] = useLocalStorage("bg-url",profile?.bgImage || "");
  const [cardHeaderStyle, setCardHeaderStyle] = useLocalStorage(
    "card-header-style",
    profile?.cardStyle || CARD_HEADER_STYLE[0]
  );
  const [openLinkInNewTab, setOpenLinkInNewTab] = useLocalStorage(
    "open-links-in-new-tab",
    profile?.linkInNewTab || DEF_OPEN_LINK_IN_NEW_TAB
  );
  const [useNeonShadow, setUseNeonShadow] = useLocalStorage(
    "useNeonShadow",
    profile?.enableNeonShadows || DEF_USE_NEON_SHADOW
  );
  const [cardVerticalAligment, setCardVerticalAligment] = useLocalStorage(
    "card-vertical-aligment",
    profile?.cardPosition || CARD_VERTICAL_ALIGMENT[0]
  );
  const [columns, setColumns] = useLocalStorage(
    "columns",
    profile?.columns || DEF_COLUMNS
  );
  const [maxItemsInList, setMaxItemsInList] = useLocalStorage(
    "max-items-in-list",
    profile?.maxNumberOfLinks || DEF_MAX_ITEMS
  );

  useEffect(() => {
    if (syncSettings) {
      setBgUrl(profile?.bgImage);
      setUseImageAsBg(profile?.useBgImage);
      setCardHeaderStyle(profile?.cardStyle);
      setOpenLinkInNewTab(profile?.linkInNewTab);
      setUseNeonShadow(profile?.enableNeonShadows);
      setCardVerticalAligment(profile?.cardPosition);
      setColumns(profile?.columns);
      setMaxItemsInList(profile?.maxNumberOfLinks);
    }
  }, [profile, syncSettings]);

  useEffect(() => {
    abortController.current = new AbortController();
    if (syncSettings) {
      postJSON(
        "/api/settings/user",
        {
          bgImage: bgUrl,
          useBgImage: useImageAsBg,
          cardStyle: cardHeaderStyle,
          linkInNewTab: openLinkInNewTab,
          enableNeonShadows: useNeonShadow,
          cardPosition: cardVerticalAligment,
          columns: columns,
          maxNumberOfLinks: maxItemsInList,
        },
        abortController.current.signal
      );
    }
    return () => {
      abortController.current.abort();
    };
  }, [
    bgUrl,
    cardHeaderStyle,
    cardVerticalAligment,
    columns,
    maxItemsInList,
    openLinkInNewTab,
    useImageAsBg,
    useNeonShadow,
  ]);

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

  return (
    <UserSettingsContext.Provider
      value={{
        theme,
        bgUrl,
        useImageAsBg,
        cardHeaderStyle,
        openLinkInNewTab,
        useNeonShadow,
        cardVerticalAligment,
        columns,
        maxItemsInList,
        syncSettings,
        setUseImageAsBg,
        setBgUrl,
        setTheme,
        setCardHeaderStyle,
        setOpenLinkInNewTab,
        setUseNeonShadow,
        setCardVerticalAligment,
        setColumns,
        setMaxItemsInList,
        setSyncSettings,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};
