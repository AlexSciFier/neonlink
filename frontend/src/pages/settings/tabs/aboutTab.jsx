import React from "react";
import { APP_NAME, VERSION } from "../../../helpers/constants";
import InputGroup from "../components/inputGroup";

export default function AboutTab() {
  return (
    <div>
      <InputGroup title={APP_NAME.toLocaleUpperCase()}>
        <div>Open-source self-hosted bookmark service</div>
        <div>Version {VERSION}</div>
      </InputGroup>
    </div>
  );
}
