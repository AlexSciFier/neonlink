import React from "react";
import InputGroup from "../../components/inputGroup";
import ChangePassword from "./ChangePassword";
import ImportBookmark from "./ImportBookmark";

export default function MainTab() {
  return (
    <div>
      <InputGroup title={"Account"}>
        <ChangePassword />
      </InputGroup>
      <InputGroup title={"Import"}>
        <ImportBookmark />
      </InputGroup>
    </div>
  );
}
