import React from "react";
import { useState } from "react";
import { BUTTON_BASE_CLASS } from "../../../../helpers/baseDesign";
import { getJSON } from "../../../../helpers/fetch";

export default function BatchEditing() {
  const [isLoading, setIsLoading] = useState(false);
  function handleUpdateIconClick() {
    setIsLoading(true);
    async function requestUpdateLinks() {
      let res = await getJSON("/api/utils/updatelinks");
      setIsLoading(false);
      if (res.ok) {
      }
    }
    requestUpdateLinks();
  }
  return (
    <div>
      <button
        disabled={isLoading}
        className={BUTTON_BASE_CLASS}
        onClick={handleUpdateIconClick}
      >
        Update all links
      </button>
      <div>This will update title, description and icon in all links.</div>
    </div>
  );
}
