import React, { useContext, useState, useEffect, useRef } from "react";
import {
  CARD_HEADER_STYLE,
  CARD_VERTICAL_ALIGMENT,
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
  const [bgUrl, setBgUrl] = useState(profile?.bgImage);
  const abortController = useRef(null);
  useEffect(() => {
    setBgUrl(profile?.bgImage);
  }, [profile?.bgImage]);

  useEffect(() => {
    abortController.current = new AbortController();
    if (bgUrl && bgUrl !== "")
      postJSON(
        "/api/users/settings",
        { bgImage: bgUrl },
        abortController.current.signal
      );

    return () => {
      abortController.current.abort();
    };
  }, [bgUrl]);

  const [useImageAsBg, setUseImageAsBg] = useLocalStorage(
    "use-image-as-bg",
    false
  );
  const [cardHeaderStyle, setCardHeaderStyle] = useLocalStorage(
    "card-header-style",
    CARD_HEADER_STYLE[0]
  );
  const [openLinkInNewTab, setOpenLinkInNewTab] = useLocalStorage(
    "open-links-in-new-tab",
    DEF_OPEN_LINK_IN_NEW_TAB
  );
  const [useNeonShadow, setUseNeonShadow] = useLocalStorage(
    "useNeonShadow",
    DEF_USE_NEON_SHADOW
  );
  const [cardVerticalAligment, setCardVerticalAligment] = useLocalStorage(
    "card-vertical-aligment",
    CARD_VERTICAL_ALIGMENT[0]
  );

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
        setUseImageAsBg,
        setBgUrl,
        setTheme,
        setCardHeaderStyle,
        setOpenLinkInNewTab,
        setUseNeonShadow,
        setCardVerticalAligment,
      }}
    >
      {children}
    </InterfaceSettingsContext.Provider>
  );
};
