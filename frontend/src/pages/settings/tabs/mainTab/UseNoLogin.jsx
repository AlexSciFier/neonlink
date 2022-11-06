import React, { useEffect, useRef, useState } from "react";
import { getJSON, postJSON } from "../../../../helpers/fetch";
import InputItem from "../../components/inputItem";
import SwitchButton from "../../components/SwitchButton";
import KeyIcon from "@heroicons/react/outline/KeyIcon";

export default function UseNoLogin() {
  const [useNoLogin, setUseNoLogin] = useState(false);

  const abortController = useRef(null);

  useEffect(() => {
    abortController.current = new AbortController();
    async function fetchSettings() {
      let res = await getJSON(
        "/api/users/settings/global",
        abortController.current.signal
      );
      let body = await res.json();
      setUseNoLogin(body?.noLogin || false);
    }
    fetchSettings();
    return () => {
      abortController.current.abort();
    };
  }, []);

  async function setParameter(value) {
    await postJSON(
      "/api/users/settings/global",
      { noLogin: value },
      abortController.current.signal
    );
    console.log(value);
    setUseNoLogin(value);
  }

  return (
    <div>
      <InputItem
        title={"No login"}
        description={"Disable login screen"}
        icon={<KeyIcon />}
        input={
          <SwitchButton
            id={"useNoLogin"}
            name={"useNoLogin"}
            checked={useNoLogin}
            onChange={(e) => setParameter(e.target.checked)}
          />
        }
      />
    </div>
  );
}
