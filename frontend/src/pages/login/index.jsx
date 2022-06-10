import React, { useRef, useState } from "react";
import { Navigate } from "react-router";
import { useIsloggedIn } from "../../context/isLoggedIn";
import { postJSON } from "../../helpers/fetch";

export default function LoginPage() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState();
  const { setProfile, profile } = useIsloggedIn();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let username = usernameRef.current.value;
    let password = passwordRef.current.value;
    setError(undefined);
    try {
      let res = await postJSON("/api/users/login", { username, password });
      let resData = await res.json();
      if (res.ok) {
        setProfile(resData);
        setIsLoggedIn(true);
      } else {
        setError(resData);
        setIsLoggedIn(false);
      }
    } catch (err) {
      setError({ message: err.message });
      setIsLoggedIn(false);
    }
  };

  if (isLoggedIn || profile) return <Navigate to={"/"} />;

  return (
    <div className="flex flex-col justify-center w-full h-full">
      <div className="flex justify-center">
        <form className="border flex flex-col items-center sm:w-1/4 w-4/5 px-6 py-4 rounded-xl space-y-3 bg-white dark:bg-black/30 dark:backdrop-blur-xl dark:border-0">
          <h1 className="text-4xl my-3 dark:text-white">Bookmarker</h1>
          <input
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 mx-2 bg-transparent dark:text-white"
            type="text"
            placeholder="Username"
            ref={usernameRef}
          ></input>
          <input
            className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 mx-2 bg-transparent dark:text-white"
            type="password"
            placeholder="Password"
            ref={passwordRef}
          ></input>
          {error ? <span className="text-red-500">{error.message}</span> : null}
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
