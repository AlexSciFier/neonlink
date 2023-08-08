import React from "react";
import { BUTTON_BASE_CLASS } from "../helpers/baseDesign";

export default function SaveChangesDialog({ saveChanges, undoChanges }) {
  return (
    <div className="fixed bottom-4 flex gap-3 left-1 right-1 max-w-md mx-auto items-center dark:bg-gray-800 bg-white dark:text-white border rounded p-3">
      <span className="flex-1">Unsaved changes</span>
      <button onClick={(e) => saveChanges(e)} className={BUTTON_BASE_CLASS}>
        Save
      </button>
      <button
        onClick={(e) => undoChanges(e)}
        className={
          BUTTON_BASE_CLASS +
          "bg-transparent border !text-black dark:!text-white border-cyan-500"
        }
      >
        Undo
      </button>
    </div>
  );
}
