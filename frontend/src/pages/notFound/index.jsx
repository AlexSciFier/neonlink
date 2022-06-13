import React from "react";
import Page from "../../components/Page";
export default function NotFound() {
  return (
    <Page>
      <div className="w-full flex justify-center items-center my-3">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-8xl text-gray-700">404</h1>
          <div className="text-4xl text-gray-700">Not found</div>
        </div>
      </div>
    </Page>
  );
}
