import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Logo from "../../components/Logo";
import { useIsloggedIn } from "../../context/isLoggedIn";
import { BUTTON_BASE_CLASS } from "../../helpers/baseDesign";
import { postJSON } from "../../helpers/fetch";

export default function LoginPage() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [error, setError] = useState();
  const { profile, setProfile, needRegistration } = useIsloggedIn();

  const navigate = useNavigate();

  useEffect(() => {
    if (needRegistration) navigate("/register");
    if (profile) navigate("/");
  }, [needRegistration]);

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
        navigate("/");
      } else {
        setError(resData);
      }
    } catch (err) {
      setError({ message: err.message });
    }
  };

  return (
    <div className="flex flex-col justify-center w-full h-full">
      <div className="flex justify-center">
        <form className="border flex flex-col items-center lg:w-1/4 w-4/5 px-6 py-4 rounded-xl space-y-3 bg-white dark:bg-black/30 dark:backdrop-blur-xl dark:border-0">
          <Logo />
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
            className={BUTTON_BASE_CLASS + "w-full"}
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
