import React, { useState } from "react";
import TabHeader from "./tabHeader";
import AboutTab from "./tabs/aboutTab";
import GroupTab from "./tabs/groupTab";
import MainTab from "./tabs/mainTab";
import ThemeTab from "./tabs/themeTab";

export default function TabView() {
  const tabs = [
    {
      header: "Main",
      body: <MainTab />,
    },
    {
      header: "Theme",
      body: <ThemeTab />,
    },
    {
      header: "Groups",
      body: <GroupTab />,
    },
    {
      header: "About",
      body: <AboutTab />,
    },
  ];

  const [curentTab, setCurentTab] = useState(0);

  return (
    <div>
      <ul className="flex gap-3 w-full text-lg overflow-x-auto">
        {tabs.map((tab, idx) => (
          <TabHeader
            title={tab.header}
            isActive={idx === curentTab}
            onClick={(e) => setCurentTab(idx)}
            key={idx}
          />
        ))}
      </ul>
      <div className="mt-3">{tabs[curentTab].body}</div>
    </div>
  );
}
