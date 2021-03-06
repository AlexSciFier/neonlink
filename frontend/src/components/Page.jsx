import React from "react";
import NavBar from "./NavBar";
import PageBody from "./PageBody";

export default function Page({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cover">
      <NavBar />
      <PageBody>{children}</PageBody>
    </div>
  );
}
