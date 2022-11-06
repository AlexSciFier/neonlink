import React from "react";
import InputGroup from "../../components/inputGroup";
import BatchEditing from "./BatchEditing";
import ChangePassword from "./ChangePassword";
import ExportBookmarks from "./ExportBookmarks";
import ImportBookmark from "./ImportBookmark";
import UseNoLogin from "./UseNoLogin";

export default function MainTab() {
  return (
    <div className="flex flex-col gap-3">
      <InputGroup title={"Account"}>
        <ChangePassword />
        <UseNoLogin />
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
