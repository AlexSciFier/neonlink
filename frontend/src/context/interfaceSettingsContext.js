import React, { useContext, useState, useEffect, useRef } from "react";
import {
  CARD_HEADER_STYLE,
  CARD_VERTICAL_ALIGMENT,
  DEF_COLUMNS,
  DEF_MAX_ITEMS,
  DEF_OPEN_LINK_IN_NEW_TAB,
  DEF_USE_NEON_SHADOW,
} from "../helpers/constants";
import { postJSON } from "../helpers/fetch";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useIsloggedIn } from "./isLoggedIn";

function getPreferedScheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

const InterfaceSettingsContext = React.createContext();

export function useInterfaceSettings() {
  return useContext(InterfaceSettingsContext);
}

export const InterfaceSettingsProvider = ({ initialTheme, children }) => {
  const { profile } = useIsloggedIn();

  const [lSTheme, setLSTheme] = useLocalStorage(
    "theme-mode",
    getPreferedScheme()
  );

  const [theme, setTheme] = useState(lSTheme);

  const abortController = useRef(null);

  const [useImageAsBg, setUseImageAsBg] = useState(
    profile?.useBgImage || false
  );
  const [bgUrl, setBgUrl] = useState(profile?.bgImage || "");
  const [cardHeaderStyle, setCardHeaderStyle] = useState(
    profile?.cardStyle || CARD_HEADER_STYLE[0]
  );
  const [openLinkInNewTab, setOpenLinkInNewTab] = useState(
    profile?.linkInNewTab || DEF_OPEN_LINK_IN_NEW_TAB
  );
  const [useNeonShadow, setUseNeonShadow] = useState(
    profile?.enableNeonShadows || DEF_USE_NEON_SHADOW
  );
  const [cardVerticalAligment, setCardVerticalAligment] = useState(
    profile?.cardPosition || CARD_VERTICAL_ALIGMENT[0]
  );
  const [columns, setColumns] = useState(profile?.columns || DEF_COLUMNS);
  const [maxItemsInList, setMaxItemsInList] = useState(
    profile?.maxNumberOfLinks || DEF_MAX_ITEMS
  );

  useEffect(() => {
    setBgUrl(profile?.bgImage);
    setUseImageAsBg(profile?.useBgImage);
    setCardHeaderStyle(profile?.cardStyle);
    setOpenLinkInNewTab(profile?.linkInNewTab);
    setUseNeonShadow(profile?.enableNeonShadows);
    setCardVerticalAligment(profile?.cardPosition);
    setColumns(profile?.columns);
    setMaxItemsInList(profile?.maxNumberOfLinks);
  }, [profile]);

  useEffect(() => {
    abortController.current = new AbortController();
    postJSON(
      "/api/users/settings",
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
    <InterfaceSettingsContext.Provider
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
        setUseImageAsBg,
        setBgUrl,
        setTheme,
        setCardHeaderStyle,
        setOpenLinkInNewTab,
        setUseNeonShadow,
        setCardVerticalAligment,
        setColumns,
        setMaxItemsInList,
      }}
    >
      {children}
    </InterfaceSettingsContext.Provider>
  );
};
