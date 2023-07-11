import React, { useEffect, useRef, useState } from "react";
import { postJSON } from "../../../../helpers/fetch";
import { useAppSettings } from "../../../../context/settings/appSettings";
import InputItem from "../../components/inputItem";
import SwitchButton from "../../components/SwitchButton";
import KeyIcon from "@heroicons/react/24/outline/KeyIcon";

export default function UseAuthentication() {
  let { authenticationEnabled, setAuthenticationEnabled, fetchSettings } = useAppSettings();

  const abortController = useRef(null);

  useEffect(() => {
    abortController.current = new AbortController();
    fetchSettings(abortController.current);
    return () => {
      abortController.current.abort();
    };
  }, []);

  async function setParameter(value) {
    await postJSON(
      "/api/settings/application",
      { authenticationEnabled: value },
      abortController.current.signal
    );
    console.log(value);
    setAuthenticationEnabled(value);
  }

  return (
    <div>
      <InputItem
        title={"Authentication"}
        description={"Enable authentication screen"}
        icon={<KeyIcon />}
        input={
          <SwitchButton
            id={"authenticationEnabled"}
            name={"authenticationEnabled"}
            checked={authenticationEnabled}
            onChange={(e) => setParameter(e.target.checked)}
          />
        }
      />
    </div>
  );
}
