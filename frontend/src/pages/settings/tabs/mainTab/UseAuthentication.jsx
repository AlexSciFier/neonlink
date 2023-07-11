import React, { useEffect, useRef, useState } from "react";
import { getJSON, postJSON } from "../../../../helpers/fetch";
import InputItem from "../../components/inputItem";
import SwitchButton from "../../components/SwitchButton";
import KeyIcon from "@heroicons/react/24/outline/KeyIcon";

export default function UseAuthentication() {
  const [useAuthentication, setUseAuthentication] = useState(false);

  const abortController = useRef(null);

  useEffect(() => {
    abortController.current = new AbortController();
    async function fetchSettings() {
      let res = await getJSON(
        "/api/settings/application",
        abortController.current.signal
      );
      let body = await res.json();
      setUseAuthentication(body?.authenticationEnabled || false);
    }
    fetchSettings();
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
    setUseAuthentication(value);
  }

  return (
    <div>
      <InputItem
        title={"Authentication"}
        description={"Enable authentication screen"}
        icon={<KeyIcon />}
        input={
          <SwitchButton
            id={"useAuthentication"}
            name={"useAuthentication"}
            checked={useAuthentication}
            onChange={(e) => setParameter(e.target.checked)}
          />
        }
      />
    </div>
  );
}
