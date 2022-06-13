import React from "react";
import InputGroup from "../components/inputGroup";
import SwitchButton from "../components/SwitchButton";
import { useTheme } from "../../../context/themeContext";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

export default function ThemeTab() {
  const { theme, setTheme } = useTheme();

  const colorThemes = [
    {
      name: "Cyan-Fuchsia",
      from: "from-cyan-600",
      to: "to-fuchsia-600",
      accent: "text-cyan-600",
      bgAccent: "bg-cyan-600",
    },
  ];

  const [columns, setColumns] = useLocalStorage("dashboardColumns", 3);

  console.log();

  function changeTheme(e) {
    let isChecked = e.target.checked;
    if (isChecked) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }
  return (
    <div className="space-y-6">
      <InputGroup title={"Appearance"}>
        <div className="flex flex-col w-fit space-y-3">
          <SwitchButton
            id={"dark-mode"}
            name={"dark-mode"}
            text={"Dark mode"}
            checked={theme === "dark"}
            onChange={(e) => changeTheme(e)}
          />
          <div className="flex flex-col">
            <label>Theme color</label>
            <select className="rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white">
              {colorThemes.map((theme) => (
                <option key={theme.name}>{theme.name}</option>
              ))}
            </select>
          </div>
        </div>
      </InputGroup>
      <InputGroup title={"Dashboard"}>
        <div className="flex flex-col gap-3 w-fit">
          <div className="flex flex-col">
            <label htmlFor="dashboard-columns">Columns </label>
            <select
              id="dashboard-columns"
              defaultValue={columns}
              className="rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
              onChange={(e) => setColumns(e.target.value)}
            >
              {[...Array(Number.parseInt(6))].map((i, idx) => (
                <option key={idx} value={idx + 1}>
                  {idx + 1}
                </option>
              ))}
            </select>
          </div>
          <SwitchButton
            id={"use-dashboard-bg"}
            name={"use-dashboard-bg"}
            text={"Use image as background"}
          />
          <div className="flex flex-col">
            <label htmlFor="bg-image-url">Image url</label>
            <input
              type={"url"}
              id="bg-image-url"
              placeholder="Link to image"
              className="rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            ></input>
          </div>
        </div>
      </InputGroup>
    </div>
  );
}
