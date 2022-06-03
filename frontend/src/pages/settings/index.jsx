import React from "react";
import NavBar from "../../components/NavBar";
import PageBody from "../../components/PageBody";

import TabView from "./tabView";

export default function SettingsPage() {
  return (
    <div>
      <NavBar />
      <PageBody>
        <div className="p-12 w-full">
          <TabView></TabView>
        </div>
      </PageBody>
    </div>
  );
}
