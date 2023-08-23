import React, { useEffect, useRef, useState } from "react";
import { notify } from "../../../../components/Notification";
import { deleteJSON, getJSON, putJSON } from "../../../../helpers/fetch";
import UserItem from "./UserItem";
import { appSettingsKeys, useAppSettingsStore } from "../../../../stores/appSettingsStore";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(undefined);
  const [authenticationEnabled] = useAppSettingsStore(
    appSettingsKeys.AuthenticationEnabled
  );

  const abortController = useRef(null);

  async function fetchUsers() {
    setIsLoading(true);
    setIsError(undefined);

    abortController.current = new AbortController();

    let res = await getJSON(`/api/users`, abortController.current.signal);
    if (res.ok) {
      let json = await res.json();
      setUsers(json);
    } else {
      setIsError(await res.json());
    }
    setIsLoading(false);
  }

  async function deleteUser(id) {
    abortController.current = new AbortController();

    let res = await deleteJSON(
      `/api/users/${id}`,
      abortController.current.signal
    );

    if (res.ok) {
      setUsers((prev) => {
        return prev.filter((user) => user.id !== id);
      });
    } else {
      setIsError(await res.json());
    }
    setIsLoading(false);
  }

  async function editUser(id, password, isAdmin) {
    abortController.current = new AbortController();

    let res = await putJSON(
      `/api/users/${id}`,
      { isAdmin, ...(password && { password }) },
      abortController.current.signal
    );

    if (res.ok) {
      setUsers((prev) => {
        let idx = prev.findIndex((user) => user.id === id);
        prev[idx].isAdmin = isAdmin;
        return prev;
      });
    } else {
      setIsError(await res.json());
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchUsers();

    return () => {
      abortController.current.abort();
    };
  }, []);

  useEffect(() => {
    if (isError && authenticationEnabled) {
      notify(
        "Error",
        "Can't get list of users. " + isError?.message || "",
        "error"
      );
    }
  }, [isError, authenticationEnabled]);

  if (isLoading) return <div>Loading...</div>;

  if (users.length === 0) return <div>No users</div>;

  return (
    <ul className="border rounded px-4 py-2 flex flex-col gap-1">
      {users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          deleteUser={deleteUser}
          editUser={editUser}
        />
      ))}
    </ul>
  );
}
