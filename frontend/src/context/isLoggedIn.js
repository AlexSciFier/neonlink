import React, { createContext, useContext, useState } from "react";

const IsloggedIn = createContext();

export function useIsloggedIn() {
  return useContext(IsloggedIn);
}

export function IsLoggedInProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  return (
    <IsloggedIn.Provider
      value={{
        isLoggedIn,
        profile,
        isProfileLoading,
        setIsLoggedIn,
        setProfile,
        setIsProfileLoading,
      }}
    >
      {children}
    </IsloggedIn.Provider>
  );
}
