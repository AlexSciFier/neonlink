import React, { createContext, useContext, useState } from "react";
import { getJSON, putJSON } from "../helpers/fetch";

const IsloggedIn = createContext();

export function useIsloggedIn() {
  return useContext(IsloggedIn);
}

export function IsLoggedInProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [needRegistration, setNeedRegistration] = useState(true);

  async function changePassword(currentPassword, newPassword) {
    let res = await putJSON("/api/users/changePassword", {
      username: profile.username,
      currentPassword,
      newPassword,
    });
    return res.ok;
  }

  async function fetchProfile() {
    setIsProfileLoading(true);
    var res;
    setNeedRegistration(false);
    try {
      res = await getJSON("/api/users/me");
    } catch (error) {
      setProfile(undefined);
      setIsProfileLoading(false);
    }

    if (res.ok) {
      setProfile(await res.json());
      setIsProfileLoading(false);
    } else {
      if (res.status === 404) {
        setNeedRegistration(true);
      }
      setProfile(undefined);
      setIsProfileLoading(false);
    }
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
        setNeedRegistration,
        fetchProfile,
      }}
    >
      {children}
    </IsloggedIn.Provider>
  );
}
