import React from "react";
import { APP_NAME, VERSION } from "../../../helpers/constants";
import InputGroup from "../components/inputGroup";

export default function AboutTab() {
  return (
    <div>
      <InputGroup
        title={
          <div className="flex gap-1 items-center">
            <div
              style={{ backgroundImage: "url(/logo.svg)" }}
              className="w-6 h-6"
            ></div>
            <span>{APP_NAME.toLocaleUpperCase()}</span>
          </div>
        }
      >
        <div>
          <p>Open-source self-hosted bookmark service</p>
          <p>Version {VERSION}</p>
        </div>
      </InputGroup>
    </div>
  );
}
