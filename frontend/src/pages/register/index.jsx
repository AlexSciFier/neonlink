import React, { useEffect, useState } from "react";
import { postJSON } from "../../helpers/fetch";
import { useNavigate } from "react-router-dom";
import { useIsloggedIn } from "../../context/isLoggedIn";
import Logo from "../../components/Logo";
import { BUTTON_BASE_CLASS } from "../../helpers/baseDesign";

export default function RegisterPage() {
  let { needRegistration, setNeedRegistration } = useIsloggedIn();
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
    if (needRegistration === false) navigate("/");
  }, [needRegistration]);

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
        setNeedRegistration(false);
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
      <div className="flex flex-col gap-3 items-center lg:w-1/4 w-4/5 px-6 py-4 rounded-xl bg-white dark:bg-black/30 dark:backdrop-blur-xl dark:border-0">
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
