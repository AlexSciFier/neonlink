import React, { useState } from "react";
import { APP_NAME, VERSION } from "../../../helpers/constants";
import InputGroup from "../components/inputGroup";
import "../../../../package.json";
import { useEffect } from "react";

export default function AboutTab() {
  const [updateVersion, setUpdateVersion] = useState();

  useEffect(() => {
    async function fetchVersion() {
      let res = await fetch(
        "https://api.github.com/repos/alexscifier/neonlink/releases/latest"
      );
      if (res.ok === false) return;

      let body = await res.json();
      let newVersionString = body.tag_name;
      let newVersion = parseInt(newVersionString.replace(/\D/g, ""), 10);
      let oldVersion = parseInt(VERSION.replace(/\D/g, ""), 10);
      if (newVersion > oldVersion) setUpdateVersion(newVersionString);
    }
    fetchVersion();
  }, []);

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
          {updateVersion && (
            <div className="my-3 rounded border p-3">
              <p className="text-lg">
                New version{" "}
                <span className="text-cyan-600">{updateVersion}</span> available
                for update!
              </p>
              <a
                className="text-cyan-600 hover:underline"
                href={`https://github.com/AlexSciFier/neonlink/releases/latest`}
                target={"_blank"}
                rel="noreferrer"
              >
                View changes on GitHub
              </a>
            </div>
          )}
          <p>
            Source code:{" "}
            <a
              href="https://github.com/AlexSciFier/neonlink"
              target={"_blank"}
              rel="noreferrer"
              className="text-cyan-600 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </InputGroup>
    </div>
  );
}
