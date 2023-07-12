import { createGlobalStore } from "../hooks/useGlobalStore";
import { getJSON } from "../helpers/fetch";

const appSettingsKeys = {
  AuthenticationEnabled: "authenticationEnabled",
  RegistrationEnabled: "registrationEnabled",
  SessionLengthInDays: "sessionLengthInDays",
};

const [, setAppSettingsStore, useAppSettingsStore] = createGlobalStore({
  authenticationEnabled: true,
  registrationEnabled: true,
  sessionLengthInDays: 60,
});

async function fetchAppSettings(abortController) {
  const res = await getJSON(
    "/api/settings/application",
    abortController?.signal
  );

  if (!abortController.signal.aborted && res.ok) {
    const json = await res.json();
    setAppSettingsStore(
      appSettingsKeys.AuthenticationEnabled,
      json.authenticationEnabled
    );
    setAppSettingsStore(
      appSettingsKeys.RegistrationEnabled,
      json.registrationEnabled
    );
    setAppSettingsStore(
      appSettingsKeys.SessionLengthInDays,
      json.sessionLengthInDays
    );
  }
}

export { appSettingsKeys, useAppSettingsStore, fetchAppSettings };
