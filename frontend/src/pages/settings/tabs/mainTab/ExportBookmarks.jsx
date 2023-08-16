import React, { useEffect } from "react";
import { useState } from "react";
import { BUTTON_BASE_CLASS } from "../../../../helpers/baseDesign";
import { getJSON } from "../../../../helpers/fetch";
import { notify } from "../../../../components/Notification";

export default function ExportBookmarks() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  async function downloadBookmarks() {
    setIsLoading(true);
    setError();
    let res = await getJSON("/api/bookmarks/export");
    if (res.ok) {
      let data = await res.blob();
      var url = window.URL.createObjectURL(data);
      var a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setIsLoading(false);
    } else {
      setError((await res.json()).message);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (error) notify("Error", error || "", "error");
  }, [error]);

  return (
    <div>
      <button
        className={BUTTON_BASE_CLASS}
        disabled={isLoading}
        onClick={downloadBookmarks}
      >
        {isLoading ? "Loading..." : "Export .html"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
