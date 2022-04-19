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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add bookmark
        </Link>
        <Link className="leading-loose" to={"/settings"}>
          {profile.username}
        </Link>
        <Link to={"/logout"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
