import React from "react";
import NavBar from "../../components/NavBar";
import GroupList from "./components/groupList";
import {
  userSettingsKeys,
  useUserSettingsStore,
} from "../../stores/userSettingsStore";
import { fixBgUrl } from "../../helpers/url";
import BackgroundImage from "../../components/BackgroundImage";

export default function Dashboard() {
  const [useImageAsBg] = useUserSettingsStore(
    userSettingsKeys.UseBackgroundgImage
  );
  const [cardVerticalAligment] = useUserSettingsStore(
    userSettingsKeys.CardVerticalAligment
  );
  const [bgUrl] = useUserSettingsStore(userSettingsKeys.BackgroundImage);
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
    <BackgroundImage
      className={"h-full flex flex-col bg-cover bg-center"}
      src={useImageAsBg && bgUrl}
    >
      <NavBar isBgTransparent={useImageAsBg} />
      <div className={`flex flex-1 flex-col w-full my-3 ${aligmentClass}`}>
        <GroupList />
      </div>
    </BackgroundImage>
  );
}
