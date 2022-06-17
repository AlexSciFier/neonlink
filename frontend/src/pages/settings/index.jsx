import React from "react";
import Page from "../../components/Page";

import TabView from "./tabView";

export default function SettingsPage() {
  return (
    <Page>
      <div className="flex w-full justify-center">
        <TabView />
      </div>
    </Page>
  );
}
