import { LogoutIcon, PlusIcon } from "@heroicons/react/outline";
import React from "react";
import { Link } from "react-router-dom";
import { useIsloggedIn } from "../context/isLoggedIn";

export default function NavBar() {
  const { profile } = useIsloggedIn();
  return (
    <div className="flex justify-between text-white py-3 px-6">
      <Link to="/" className="text-2xl font-light ">
        Bookmark App
      </Link>
      <div className="flex gap-3 items-center">
        <Link
          to={"/add"}
          className="bg-cyan-500 text-white px-4 h-full rounded flex items-center gap-1"
        >
          <PlusIcon className="w-6 h-6" />
          <span className="hidden md:inline">Add bookmark</span>
        </Link>
        <Link className="leading-loose" to={"/settings"}>
          {profile.username}
        </Link>
        <Link to={"/logout"}>
          <LogoutIcon className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
