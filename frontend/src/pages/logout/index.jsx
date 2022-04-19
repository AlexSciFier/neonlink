import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { postJSON } from "../../helpers/fetch";

export default function Logout() {
  const [navigate, setNavigate] = useState(false);
  useEffect(() => {
    postJSON("http://localhost:3333/api/users/logout", JSON.stringify({})).then(
      (res) => {
        setNavigate(true);
      }
    );
  }, []);
  if (navigate) return <Navigate to={"/"} />;
  return <div></div>;
}
