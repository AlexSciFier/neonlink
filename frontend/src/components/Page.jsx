import React from "react";
import PageBody from "./PageBody";

export default function Page({ children }) {
  return (
    <div className="min-h-[calc(100%-64px)] flex flex-col bg-cover">
      <PageBody>{children}</PageBody>
    </div>
  );
}
