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

  function abort() {
    abortController.current.abort();
  }

  useEffect(() => {
    abortController.current = new AbortController();

    async function fetchData() {
      let res = await getJSON(
        "/api/settings/application",
        abortController.current.signal
      );
      if (res.ok) {
        let json = await res.json();
        setAuthenticationEnabled(json.authenticationEnabled);
        setRegistrationEnabled(json.registrationEnabled);
        setSessionLengthInDays(json.sessionLengthInDays);
      }
    }

    fetchData().catch(console.error);
    
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        authenticationEnabled,
        registrationEnabled,
        sessionLengthInDays
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
