import React from "react";
import InputGroup from "../components/inputGroup";
import SwitchButton from "../components/SwitchButton";
import { useTheme } from "../../../context/themeContext";

export default function ThemeTab() {
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
  );
}
