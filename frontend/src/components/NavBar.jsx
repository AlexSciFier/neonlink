import {
  Cog6ToothIcon,
  LinkIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BUTTON_BASE_CLASS } from "../helpers/baseDesign";
import { APP_NAME } from "../helpers/constants";
import { postJSON } from "../helpers/fetch";

export default function NavBar({ isBgTransparent = false }) {
  const [searchParams] = useSearchParams();
  let tag = searchParams.get("tag");

  function logoutHandler() {
    postJSON("/api/users/logout", JSON.stringify({})).then((res) => {
      window.location.reload();
    });
  }

  return (
    <div
      className={`flex justify-between text-white py-3 px-6 font-['RalewayLight'] ${
        isBgTransparent === false &&
        "bg-gradient-to-r from-white/0 to-white/0 dark:from-cyan-600 dark:to-fuchsia-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <Link to="/" className="text-2xl font-light flex items-center gap-1">
          <div
            style={{ backgroundImage: "url(/logo.svg)" }}
            className="w-6 h-6"
          ></div>
          <div className="md:block hidden">{tag ? `#${tag}` : APP_NAME}</div>
        </Link>
      </div>

      <div className="flex gap-3 items-center">
        <Link to={"/add"} className={BUTTON_BASE_CLASS + "flex gap-2"}>
          <PlusIcon className="w-6 h-6" />
          <span className="hidden md:inline">Add bookmark</span>
        </Link>
        <Link className="leading-loose flex group gap-1" to="/links">
          <LinkIcon className="w-8 h-8 p-1 rounded-full group-hover:bg-white/20" />
          <span className="md:block hidden">Links</span>
        </Link>
        <Link className="leading-loose flex group gap-1" to={"/settings"}>
          <Cog6ToothIcon className="w-8 h-8 p-1 rounded-full group-hover:bg-white/20" />
          <span className="md:block hidden">Settings</span>
        </Link>
        <button
          onClick={logoutHandler}
          className="flex items-center group gap-1"
        >
          <ArrowRightOnRectangleIcon className="w-8 h-8 p-1 rounded-full group-hover:bg-white/20" />
          <span className="md:block hidden">Logout</span>
        </button>
      </div>
    </div>
  );
}
