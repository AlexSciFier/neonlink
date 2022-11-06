import React from "react";
import NavBar from "../../components/NavBar";
import GroupList from "./components/groupList";
import { useInterfaceSettings } from "../../context/interfaceSettingsContext";
import { fixBgUrl } from "../../helpers/url";

export default function Dashboard() {
  const { bgUrl, cardVerticalAligment, useImageAsBg } = useInterfaceSettings();
  let aligmentClass = "";
  switch (cardVerticalAligment) {
    case "top":
      aligmentClass = "";
      break;
    case "center":
      aligmentClass = "justify-center";
      break;
    case "bottom":
      aligmentClass = "justify-end";
      break;
    default:
      aligmentClass = "";
      break;
  }
  
  return (
    <div
      className="h-full flex flex-col bg-cover bg-center"
      style={{ backgroundImage: useImageAsBg && `url(${fixBgUrl(bgUrl)})` }}
    >
      <NavBar isBgTransparent={useImageAsBg} />
      <div className={`flex flex-1 flex-col w-full my-3 ${aligmentClass}`}>
        <GroupList />
      </div>
    </div>
  );
}
