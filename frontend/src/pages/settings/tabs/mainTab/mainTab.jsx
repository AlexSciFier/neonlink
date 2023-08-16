import React from "react";
import InputGroup from "../../components/inputGroup";
import BatchEditing from "./BatchEditing";
import ChangePassword from "./ChangePassword";
import ExportBookmarks from "./ExportBookmarks";
import ImportBookmark from "./ImportBookmark";
import UseAuthentication from "./UseAuthentication";
import UsersList from "./UsersList";
import {
  useUserCurrentStore,
  userCurrentKeys,
} from "../../../../stores/userCurrentStore";

export default function MainTab() {
  const [isAdmin] = useUserCurrentStore(userCurrentKeys.IsAdmin);
  return (
    <div className="flex flex-col gap-3">
      {isAdmin && (
        <>
          <InputGroup title={"App"}>
            <UseAuthentication />
          </InputGroup>
          <InputGroup title={"Users"}>
            <UsersList />
          </InputGroup>
        </>
      )}
      <InputGroup title={"Account"}>
        <ChangePassword />
      </InputGroup>
      <InputGroup title={"Import"}>
        <ImportBookmark />
      </InputGroup>
      <InputGroup title={"Export"}>
        <ExportBookmarks />
      </InputGroup>
      <InputGroup title={"Batch editing"}>
        <BatchEditing />
      </InputGroup>
    </div>
  );
}
