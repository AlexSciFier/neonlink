import React, { useContext, useState, useEffect } from "react";
import { CARD_HEADER_STYLE } from "../helpers/constants";
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

const ThemeContext = React.createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export const ThemeProvider = ({ initialTheme, children }) => {
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
    <ThemeContext.Provider
      value={{
        theme,
        bgUrl,
        useImageAsBg,
        cardHeaderStyle,
        setUseImageAsBg,
        setBgUrl,
        setTheme,
        setCardHeaderStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
