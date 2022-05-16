import React from "react";
import NavBar from "../../components/NavBar";
import PageBody from "../../components/PageBody";
import { useTheme } from "../../context/themeContext";
import InputGroup from "./components/inputGroup";
import SwitchButton from "./components/SwitchButton";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  function changeTheme(e) {
    let isChecked = e.target.checked;
    if (isChecked) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  return (
    <div>
      <NavBar />
      <PageBody>
        <div className="p-12">
          <InputGroup title={"Appearance"}>
            <SwitchButton
              id={"dark-mode"}
              name={"dark-mode"}
              text={"Dark mode"}
              checked={theme === "dark"}
              onChange={(e) => changeTheme(e)}
            />
          </InputGroup>
        </div>
      </PageBody>
    </div>
  );
}
