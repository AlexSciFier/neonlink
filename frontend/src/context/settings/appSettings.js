import React, { useContext, useState, useEffect, useRef } from "react";
import { getJSON } from "../../helpers/fetch";

const AppSettingsContext = React.createContext();

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

export const AppSettingsProvider = ({ children }) => {
  const [authenticationEnabled, setAuthenticationEnabled] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [sessionLengthInDays, setSessionLengthInDays] = useState(60);
  const abortController = useRef(null);

  async function fetchSettings(abortController) {
    let res = await getJSON(
      "/api/settings/application",
      abortController.signal
    );
    if (res.ok) {
      let json = await res.json();
      setAuthenticationEnabled(json.authenticationEnabled);
      setRegistrationEnabled(json.registrationEnabled);
      setSessionLengthInDays(json.sessionLengthInDays);
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
        fetchSettings,
        setAuthenticationEnabled,
        setRegistrationEnabled,
        setSessionLengthInDays
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
