import React, { useRef, useState } from "react";
import { Navigate } from "react-router";
import { useIsloggedIn } from "../../context/isLoggedIn";
import { postJSON } from "../../helpers/fetch";

export default function LoginPage() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setProfile, profile } = useIsloggedIn();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    let username = usernameRef.current.value;
    let password = passwordRef.current.value;
    postJSON("http://localhost:3333/api/users/login", { username, password })
      .then((res) => {
        res.json().then((json) => {
          if (res.ok) {
            setProfile(json);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  if (isLoggedIn || profile) return <Navigate to={"/"} />;

  return (
    <div className="flex flex-col justify-center w-full h-full">
      <div className="flex justify-center">
        <form className="border flex flex-col items-center sm:w-1/4 w-4/5 px-6 py-4 rounded-xl space-y-3 bg-white">
          <h1 className="text-4xl my-3">Bookmarker</h1>
          <input
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 mx-2"
            type="text"
            placeholder="Username"
            ref={usernameRef}
          ></input>
          <input
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 mx-2"
            type="password"
            placeholder="Password"
            ref={passwordRef}
          ></input>
          <button
            className="w-full px-6 py-3 rounded focus:outline-none focus:ring-cyan-500 focus:ring hover:bg-cyan-500 bg-cyan-600 text-white"
            type="submit"
            onClick={handleLoginSubmit}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
