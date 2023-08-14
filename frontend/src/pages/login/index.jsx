import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import { BUTTON_BASE_CLASS } from "../../helpers/baseDesign";
import { postJSON } from "../../helpers/fetch";
import { useEffect } from "react";
import {
  appSettingsKeys,
  useAppSettingsStore,
} from "../../stores/appSettingsStore";
import {
  fetchCurrentUser,
  userCurrentKeys,
  useUserCurrentStore,
} from "../../stores/userCurrentStore";
import { fetchUserSettings } from "../../stores/userSettingsStore";

export default function LoginPage() {
  const [authenticationEnabled] = useAppSettingsStore(
    appSettingsKeys.AuthenticationEnabled
  );
  const [registrationEnabled] = useAppSettingsStore(
    appSettingsKeys.RegistrationEnabled
  );
  const [forceRegistration] = useAppSettingsStore(
    appSettingsKeys.ForceRegistration
  );
  const [authenticated] = useUserCurrentStore(userCurrentKeys.Authenticated);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [error, setError] = useState();

  const navigate = useNavigate();
  useEffect(() => {
    if (forceRegistration) navigate("/registration");
    if (authenticated === true || authenticationEnabled === false)
      navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, forceRegistration, authenticationEnabled]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    let username = usernameRef.current.value;
    let password = passwordRef.current.value;

    setError(undefined);

    try {
      let res = await postJSON("/api/users/login", { username, password });
      if (res.ok) {
        await fetchCurrentUser();
        await fetchUserSettings();
        navigate("/");
      } else {
        setError(await res.json());
      }
    } catch (err) {
      setError({ message: err.message });
    }
  };

  function RegisterLink() {
    return (
      <Link
        to={"/register"}
        className="text-cyan-500 hover:text-cyan-400 hover:underline"
      >
        Sign up
      </Link>
    );
  }

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
          {registrationEnabled ? <RegisterLink /> : null}
        </form>
      </div>
    </div>
  );
}
