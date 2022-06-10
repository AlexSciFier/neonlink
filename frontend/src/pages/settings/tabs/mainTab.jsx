import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useIsloggedIn } from "../../../context/isLoggedIn";
import InputGroup from "../components/inputGroup";

function PasswordBox({ id, name, placeholder, onChange, isValid = true }) {
  return (
    <>
      <input
        type={"password"}
        placeholder={placeholder}
        onChange={onChange}
        id={id}
        name={name}
        className={`${
          isValid ? "" : "border-red-600"
        } rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white`}
      ></input>
      {isValid === false ? (
        <label htmlFor={id} className="text-red-600">
          Passwords does not match
        </label>
      ) : null}
    </>
  );
}

export default function MainTab() {
  const { profile, changePassword } = useIsloggedIn();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isNewPasswordEmpty, setIsNewPasswordEmpty] = useState(true);

  useEffect(() => {
    validatePassword();
  }, [confirmPassword, newPassword]);

  function validatePassword() {
    if (confirmPassword === newPassword) setIsPasswordValid(true);
    else setIsPasswordValid(false);
    if (newPassword === "") setIsNewPasswordEmpty(true);
    else setIsNewPasswordEmpty(false);
  }

  async function handleChangeClick() {
    console.log("click");
    if (isPasswordValid && isNewPasswordEmpty === false) {
      await changePassword(currentPassword, newPassword);
    }
  }

  return (
    <div>
      <InputGroup title={"Account"}>
        <div className="flex flex-col items-start">
          <div className="text-xl">{profile.username}</div>
          <div className="flex flex-col gap-2 mt-3">
            <PasswordBox
              placeholder={"Current password"}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordBox
              placeholder={"New password"}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordBox
              placeholder={"Confirm new password"}
              isValid={isPasswordValid}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <input
            type={"button"}
            value={"Change password"}
            onClick={handleChangeClick}
            disabled={isNewPasswordEmpty || isPasswordValid === false}
            className="bg-cyan-500 rounded px-4 py-2 cursor-pointer hover:bg-cyan-400 mt-3 text-white disabled:bg-gray-500 disabled:cursor-auto"
          ></input>
        </div>
      </InputGroup>
    </div>
  );
}
