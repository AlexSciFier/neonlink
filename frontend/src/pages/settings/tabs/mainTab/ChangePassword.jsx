import React, { useEffect, useState } from "react";
import { BUTTON_BASE_CLASS } from "../../../../helpers/baseDesign";
import { userCurrentKeys, useUserCurrentStore, changePassword } from "../../../../stores/userCurrentStore";

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

export default function ChangePassword() {
  const [ username, ] = useUserCurrentStore(userCurrentKeys.Username); 

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isNewPasswordEmpty, setIsNewPasswordEmpty] = useState(true);

  useEffect(() => {
    validatePassword();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPassword, newPassword]);

  function validatePassword() {
    if (confirmPassword === newPassword) setIsPasswordValid(true);
    else setIsPasswordValid(false);
    if (newPassword === "") setIsNewPasswordEmpty(true);
    else setIsNewPasswordEmpty(false);
  }

  async function handleChangeClick() {
    if (isPasswordValid && isNewPasswordEmpty === false) {
      await changePassword(currentPassword, newPassword);
    }
  }
  return (
    <div className="flex flex-col gap-2 items-start py-3">
      <div className="text-xl">{username}</div>
      <div className="flex flex-col gap-2">
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
        className={BUTTON_BASE_CLASS}
      ></input>
    </div>
  );
}
