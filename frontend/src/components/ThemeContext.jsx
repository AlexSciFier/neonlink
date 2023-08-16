import React, { useContext, useState, useEffect } from "react";
import { useUserSettingsStore, userSettingsKeys } from "../stores/userSettingsStore";

const ThemeContext = React.createContext();

export function useThemeContext() {
  return useContext(ThemeContext);
}

export const ThemeContextProvider = ({ initialTheme, children }) => {
  const [themeFromSettings, setThemeFromSettings] = useUserSettingsStore(userSettingsKeys.Theme);

  const [theme, setTheme] = useState(themeFromSettings);

  const rawSetTheme = (rawTheme) => {
    const root = window.document.documentElement;
    if (rawTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setThemeFromSettings(rawTheme);
  };

  if (initialTheme) {
    rawSetTheme(initialTheme);
  }

  useEffect(() => {
    rawSetTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
