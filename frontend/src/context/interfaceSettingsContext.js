import React, { useContext, useState, useEffect } from "react";
import {
  CARD_HEADER_STYLE,
  DEF_OPEN_LINK_IN_NEW_TAB,
} from "../helpers/constants";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
  const [lSTheme, setLSTheme] = useLocalStorage(
    "theme-mode",
    getPreferedScheme()
  );

  const [theme, setTheme] = useState(lSTheme);
  const [bgUrl, setBgUrl] = useLocalStorage("bg-url", "");
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
  }, [theme]);

  return (
    <InterfaceSettingsContext.Provider
      value={{
        theme,
        bgUrl,
        useImageAsBg,
        cardHeaderStyle,
        openLinkInNewTab,
        setUseImageAsBg,
        setBgUrl,
        setTheme,
        setCardHeaderStyle,
        setOpenLinkInNewTab,
      }}
    >
      {children}
    </InterfaceSettingsContext.Provider>
  );
};
