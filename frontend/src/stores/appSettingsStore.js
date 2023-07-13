import { createGlobalStore } from "../hooks/useGlobalStore";
import { getJSON, postJSON } from "../helpers/fetch";

const appSettingsKeys = {
  AuthenticationEnabled: "authenticationEnabled",
  RegistrationEnabled: "registrationEnabled",
  SessionLengthInDays: "sessionLengthInDays",
  ForceRegistration: "forceRegistration",
};

const appSettingsInitialState = {
  authenticationEnabled: true,
  registrationEnabled: true,
  sessionLengthInDays: 60,
  forceRegistration: false,
};

const [getAppSettingsStore, setAppSettingsStore, useAppSettingsStore] =
  createGlobalStore(appSettingsInitialState);

async function fetchAppSettings(abortController) {
  const res = await getJSON(
    "/api/settings/application",
    abortController?.signal
  );

  if (abortController?.signal?.aborted !== true && res.ok) {
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
    setAppSettingsStore(
      appSettingsKeys.ForceRegistration,
      json.forceRegistration
    );
  }
}

async function persistAppSettings() {
  await postJSON("/api/settings/application", {
    authenticationEnabled: getAppSettingsStore(
      appSettingsKeys.AuthenticationEnabled
    ),
    registrationEnabled: getAppSettingsStore(
      appSettingsKeys.RegistrationEnabled
    ),
    sessionLengthInDays: getAppSettingsStore(
      appSettingsKeys.SessionLengthInDays
    ),
  });
}

export {
  appSettingsKeys,
  appSettingsInitialState,
  getAppSettingsStore,
  setAppSettingsStore,
  useAppSettingsStore,
  fetchAppSettings,
  persistAppSettings,
};
