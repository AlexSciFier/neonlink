import React from "react";
import NavBar from "../../components/NavBar";
import GroupList from "./components/groupList";
import { useTheme } from "../../context/themeContext";

export default function Dashboard() {
  const { bgUrl, useImageAsBg } = useTheme();
  return (
    <div
      className="h-full flex flex-col bg-cover"
      style={{ backgroundImage: useImageAsBg && `url(${bgUrl})` }}
    >
      <NavBar isBgTransparent={useImageAsBg} />
      <div className="flex flex-1 flex-col w-full mt-3">
        <GroupList />
      </div>
    </div>
  );
}
