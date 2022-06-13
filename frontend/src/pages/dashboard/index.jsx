import React from "react";
import { Link } from "react-router-dom";
import Page from "../../components/Page";
import GroupList from "./components/groupList";

export default function Dashboard() {
  return (
    <Page>
      <div className="flex flex-col justify-center w-full">
        <GroupList />
        <div className="flex-1"></div>
        <div className="flex justify-center">
          <Link to={"/links"} className="hover:text-cyan-500">
            All links
          </Link>
        </div>
      </div>
    </Page>
  );
}
