import React, { useEffect, useState } from "react";
import TabHeader from "./tabHeader";
import AboutTab from "./tabs/aboutTab";
import GroupTab from "./tabs/groupTab/groupTab";
import MainTab from "./tabs/mainTab/mainTab";
import InterfaceTab from "./tabs/interfaceTab/interfaceTab";
import { useLocation } from "react-router";

export default function TabView() {
  const location = useLocation();
  const tabs = [
    {
      header: "Main",
      body: <MainTab />,
    },
    {
      header: "Interface",
      body: <InterfaceTab />,
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

  useEffect(() => {
    if (location.hash) {
      let found = tabs.filter((tab) => tab.header === location.hash.slice(1));
      let foundIdx = tabs.indexOf(found[0]);
      setCurentTab(foundIdx);
    }
  }, []);

  return (
    <div className="md:w-2/4 w-full px-3">
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
