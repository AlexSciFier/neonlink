import React, { createContext, useContext, useState } from "react";
import { putJSON } from "../helpers/fetch";

const IsloggedIn = createContext();

export function useIsloggedIn() {
  return useContext(IsloggedIn);
}

export function IsLoggedInProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [needRegistration, setNeedRegistration] = useState(true)

  async function changePassword(currentPassword, newPassword) {
    let res = await putJSON("/api/users/changePassword", {
      username: profile.username,
      currentPassword,
      newPassword,
    });
    return res.ok;
  }

  return (
    <IsloggedIn.Provider
      value={{
        isLoggedIn,
        profile,
        isProfileLoading,
        needRegistration,
        setIsLoggedIn,
        setProfile,
        setIsProfileLoading,
        changePassword,
        setNeedRegistration
      }}
    >
      {children}
    </IsloggedIn.Provider>
  );
}
