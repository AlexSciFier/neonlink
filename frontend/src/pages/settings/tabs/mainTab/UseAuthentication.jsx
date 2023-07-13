import React, { useState } from "react";
import InputItem from "../../components/inputItem";
import SwitchButton from "../../components/SwitchButton";
import KeyIcon from "@heroicons/react/24/outline/KeyIcon";
import { BUTTON_BASE_CLASS } from "../../../../helpers/baseDesign";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { appSettingsKeys, useAppSettingsStore, fetchAppSettings, persistAppSettings } from "../../../../stores/appSettingsStore";

export default function UseAuthentication() {
  const [ authenticationEnabled, setAuthenticationEnabled ] = useAppSettingsStore(appSettingsKeys.AuthenticationEnabled);
  const [ sessionLengthInDays, setSessionLengthInDays ] = useAppSettingsStore(appSettingsKeys.SessionLengthInDays);

  async function saveChanges(e) {
    e.preventDefault();
    await persistAppSettings();
  }

  async function undoChanges(e) {
    e.preventDefault();
    await fetchAppSettings();
  }

  return (
    //TODO: something doesn't work here when switching authentication mode
    <form>
      <InputItem
        title={"Authentication"}
        description={"Enable authentication screen"}
        icon={<KeyIcon />}
        input={
          <SwitchButton
            id={"authenticationEnabled"}
            name={"authenticationEnabled"}
            checked={authenticationEnabled}
            onChange={(e) => setAuthenticationEnabled(e.target.checked)}
          />
        }
      />
      <InputItem
        title={"Session duration"}
        description={"Days before session expires"}
        icon={<CalendarDaysIcon />}
        input={
          <input
            type="number"
            value={sessionLengthInDays}
            onChange={(e) => setSessionLengthInDays(e.target.value)}
            id="sessionLengthInDays"
            name="sessionLengthInDays"
            className="rounded border w-full focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
          ></input>
        }
      />
      {settingsChanged && (
        <div className="fixed bottom-4 flex gap-3 left-1 right-1 max-w-md mx-auto items-center dark:bg-gray-800 bg-white dark:text-white border rounded p-3">
          <span className="flex-1">Unsaved changes</span>
          <button onClick={(e) => saveChanges(e)} className={BUTTON_BASE_CLASS}>
            Save
          </button>
          <button
            onClick={(e) => undoChanges(e)}
            className={
              BUTTON_BASE_CLASS + "bg-transparent border border-cyan-500"
            }
          >
            Undo
          </button>
        </div>
      )}
    </form>
  );
}
