import React from "react";
import { Link } from "react-router-dom";
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
      <NavBar />
      <div className="flex flex-1 flex-col justify-center w-full mt-3">
        <GroupList />
        <div className="flex-1"></div>
        <div className="flex justify-center">
          <Link
            to={"/links"}
            className="hover:text-cyan-500 dark:text-white dark:hover:text-cyan-600"
          >
            All links
          </Link>
        </div>
      </div>
    </div>
  );
}
