import React from "react";
import Page from "../../components/Page";

import TabView from "./tabView";

export default function SettingsPage() {
  return (
    <Page>
      <div className="p-12 w-full">
        <TabView></TabView>
      </div>
    </Page>
  );
}
