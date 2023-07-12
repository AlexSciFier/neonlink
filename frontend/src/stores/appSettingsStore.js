import { createGlobalStore } from "../hooks/useGlobalStore";
import { getJSON } from "../helpers/fetch";

const appSettingsKeys = {
  AuthenticationEnabled: "authenticationEnabled",
  RegistrationEnabled: "registrationEnabled",
  SessionLengthInDays: "sessionLengthInDays",
};

const appSettingsInitialState = {
  authenticationEnabled: true,
  registrationEnabled: true,
  sessionLengthInDays: 60,
};

const [, setAppSettingsStore, useAppSettingsStore] = createGlobalStore(
  appSettingsInitialState
);

async function fetchUserSettings(abortController) {
  const res = await getJSON("/api/settings/user", abortController?.signal);

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

export {
  appSettingsKeys,
  appSettingsInitialState,
  useAppSettingsStore,
  fetchUserSettings,
};
