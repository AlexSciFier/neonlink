import React, { useEffect, useState } from "react";
import { postJSON } from "../../helpers/fetch";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { BUTTON_BASE_CLASS } from "../../helpers/baseDesign";
import {
  appSettingsKeys,
  useAppSettingsStore,
  fetchAppSettings,
} from "../../stores/appSettingsStore";
import {
  userCurrentKeys,
  useUserCurrentStore,
} from "../../stores/userCurrentStore";

export default function RegisterPage() {
  const [registrationEnabled] = useAppSettingsStore(
    appSettingsKeys.RegistrationEnabled
  );
  const [authenticated] = useUserCurrentStore(userCurrentKeys.Authenticated);

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(true);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated === true || registrationEnabled === false) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, registrationEnabled]);

  useEffect(() => {
    setIsFormValid(
      formData.password === formData.confirmPassword &&
        formData.password !== "" &&
        formData.login !== ""
    );
    setIsPasswordInvalid(formData.password !== formData.confirmPassword);
  }, [formData]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isFormValid) {
      let res = await postJSON("/api/users", {
        username: formData.login,
        password: formData.password,
      });
      if (res.ok) {
        await fetchAppSettings();
        navigate("/login");
      } else {
        let json = await res.json();
        setError(json.message);
      }
    }
  }

  function handleFormChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div className="flex w-screen h-screen justify-center items-center p-4 ">
      <div className="flex flex-col gap-3 items-center w-11/12 max-w-lg px-6 py-4 rounded-xl bg-white dark:bg-black/30 dark:backdrop-blur-xl dark:border-0">
        <Logo />
        <h2 className="text-2xl font-light dark:text-white">
          Register new user
        </h2>
        <form
          className="flex flex-col items-center w-full gap-3 dark:text-white"
          onSubmit={handleSubmit}
        >
          <input
            className="border dark:border-white/50 rounded bg-transparent px-4 py-2 focus:ring focus:outline-none ring-cyan-500 w-full"
            type={"text"}
            name="login"
            placeholder="Login"
            value={formData.login}
            onChange={handleFormChange}
          ></input>
          <input
            className={`border dark:border-white/50 rounded bg-transparent px-4 py-2 focus:ring focus:outline-none ring-cyan-500 w-full ${
              isPasswordInvalid && "border border-red-600"
            }`}
            type={"password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleFormChange}
          ></input>
          <input
            className={`border dark:border-white/50 rounded bg-transparent px-4 py-2 focus:ring focus:outline-none ring-cyan-500 w-full ${
              isPasswordInvalid && "border border-red-600"
            }`}
            type={"password"}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleFormChange}
          ></input>
          <button
            className={BUTTON_BASE_CLASS + "w-full"}
            type="submit"
            disabled={isFormValid === false}
          >
            Register
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      </div>
    </div>
  );
}
