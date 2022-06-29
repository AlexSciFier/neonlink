import React from "react";
import { APP_NAME } from "../helpers/constants";

export default function Logo() {
  return (
    <h1 className="text-4xl flex gap-1 items-center dark:text-white font-[RalewayLight]">
      <div
        style={{ backgroundImage: "url(/logo.svg)" }}
        className="w-9 h-9 bg-cover"
      ></div>
      {APP_NAME}
    </h1>
  );
}
