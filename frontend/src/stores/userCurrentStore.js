import { createGlobalStore } from "../hooks/useGlobalStore";
import { getJSON, putJSON } from "../helpers/fetch";

const userCurrentKeys = {
  Authenticated: "authenticated",
  Id: "id",
  Username: "username",
  IsAdmin: "isAdmin",
};

const userCurrentInitialState = {
  authenticated: false,
  id: 0,
  username: null,
  isAdmin: false,
};

const [getUserCurrentStore, setUserCurrentStore, useUserCurrentStore] =
  createGlobalStore(userCurrentInitialState);

async function changePassword(currentPassword, newPassword) {
  let res = await putJSON("/api/users/changePassword", {
    currentPassword,
    newPassword,
  });
  return res.ok;
}

async function fetchCurrentUser(abortController) {
  try {
    const res = await getJSON("/api/users/me", abortController?.signal);

    if (abortController?.signal.aborted !== true && res.ok) {
      const json = await res.json();
      setUserCurrentStore(userCurrentKeys.Authenticated, json.authenticated);
      setUserCurrentStore(userCurrentKeys.Id, json.id);
      setUserCurrentStore(userCurrentKeys.Username, json.userName);
      setUserCurrentStore(userCurrentKeys.IsAdmin, json.isAdmin);
    } else {
      throw new Error("Aborted or failed request.");
    }
  } catch (error) {
    setUserCurrentStore(
      userCurrentKeys.Authenticated,
      userCurrentInitialState.authenticated
    );
    setUserCurrentStore(userCurrentKeys.Id, userCurrentInitialState.id);
    setUserCurrentStore(
      userCurrentKeys.Username,
      userCurrentInitialState.username
    );
    setUserCurrentStore(
      userCurrentKeys.IsAdmin,
      userCurrentInitialState.isAdmin
    );
    throw error;
  }
}

export {
  getUserCurrentStore,
  setUserCurrentStore,
  userCurrentKeys,
  userCurrentInitialState,
  useUserCurrentStore,
  fetchCurrentUser,
  changePassword,
};
