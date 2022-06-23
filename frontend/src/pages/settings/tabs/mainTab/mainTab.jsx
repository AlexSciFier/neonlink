import React from "react";
import InputGroup from "../../components/inputGroup";
import ChangePassword from "./ChangePassword";
import ExportBookmarks from "./ExportBookmarks";
import ImportBookmark from "./ImportBookmark";

export default function MainTab() {
  return (
    <div className="flex flex-col gap-3">
      <InputGroup title={"Account"}>
        <ChangePassword />
      </InputGroup>
      <InputGroup title={"Import"}>
        <ImportBookmark />
      </InputGroup>
      <InputGroup title={"Export"}>
        <ExportBookmarks />
      </InputGroup>
    </div>
  );
}
