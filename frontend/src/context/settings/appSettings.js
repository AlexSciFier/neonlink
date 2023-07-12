import React, { useContext, useState, useEffect, useRef } from "react";
import { getJSON, postJSON } from "../../helpers/fetch";

const AppSettingsContext = React.createContext();

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

export const AppSettingsProvider = ({ children }) => {
  const [authenticationEnabled, setAuthenticationEnabled] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [sessionLengthInDays, setSessionLengthInDays] = useState(60);
  const [settingsError, setSettingsError] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const abortController = useRef(null);

  async function fetchSettings(abortController) {
    setSettingsError(false);
    let res = await getJSON(
      "/api/settings/application",
      abortController?.signal
    );
    if (res.ok) {
      let json = await res.json();
      setAuthenticationEnabled(json.authenticationEnabled);
      setRegistrationEnabled(json.registrationEnabled);
      setSessionLengthInDays(json.sessionLengthInDays);
    } else {
      setSettingsError(true);
    }
  }
  async function saveSettings() {
    setSettingsError(false);
    let res = await postJSON("/api/settings/application", {
      authenticationEnabled,
      registrationEnabled,
      sessionLengthInDays,
    });
    if (res.ok) {
      let json = await res.json();
      setAuthenticationEnabled(json.authenticationEnabled);
      setRegistrationEnabled(json.registrationEnabled);
      setSessionLengthInDays(json.sessionLengthInDays);
    } else {
      setSettingsError(true);
    }
  }

  useEffect(() => {
    abortController.current = new AbortController();
    fetchSettings(abortController.current);
    return () => abortController.current.abort();
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        authenticationEnabled,
        registrationEnabled,
        sessionLengthInDays,
        settingsError,
        settingsChanged,
        fetchSettings,
        saveSettings,
        setAuthenticationEnabled,
        setRegistrationEnabled,
        setSessionLengthInDays,
        setSettingsChanged,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
