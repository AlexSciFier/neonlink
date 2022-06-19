import React, { useEffect, useState } from "react";
import { postJSON } from "../../helpers/fetch";
import {useNavigate} from "react-router-dom"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(true);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsFormValid(formData.password === formData.confirmPassword && formData.password !== ""&& formData.login !== "");
    setIsPasswordInvalid(formData.password !== formData.confirmPassword)
  }, [formData]);

  async function handleSubmit(e) {
    e.preventDefault();
    if(isFormValid){
      let res = await postJSON("/api/users",{username:formData.login,password:formData.password})
      if(res.ok){
        navigate("/login")
      }else{
        console.error(await res.json())
      }
    }
  }

  function handleFormChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div className="flex w-screen h-screen justify-center items-center p-4">
      <form
        className="flex flex-col items-center md:w-96 w-full gap-3 dark:text-white"
        onSubmit={handleSubmit}
      >
        <input
          className="border border-white/50 rounded bg-transparent px-4 py-2 focus:ring focus:outline-none ring-cyan-500 w-full"
          type={"text"}
          name="login"
          placeholder="Login"
          value={formData.login}
          onChange={handleFormChange}
        ></input>
        <input
          className={`border border-white/50 rounded bg-transparent px-4 py-2 focus:ring focus:outline-none ring-cyan-500 w-full ${isPasswordInvalid && "border border-red-600"}`}
          type={"password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleFormChange}
        ></input>
        <input
          className={`border border-white/50 rounded bg-transparent px-4 py-2 focus:ring focus:outline-none ring-cyan-500 w-full ${isPasswordInvalid && "border border-red-600"}`}
          type={"password"}
          name="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleFormChange}
        ></input>
        <button
          className="bg-cyan-600 hover:bg-cyan-400 disabled:bg-gray-600 rounded px-4 py-2 w-fit"
          type="submit"
          disabled={isFormValid === false}
        >
          Register
        </button>
      </form>
    </div>
  );
}
