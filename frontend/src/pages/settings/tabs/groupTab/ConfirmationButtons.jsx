import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

export function ConfirmationButtons({ onConfirm, onCancel }) {
  return (
    <>
      <button onClick={onConfirm} className="w-5 h-5 hover:text-green-500">
        <CheckCircleIcon />
      </button>
      <button onClick={onCancel} className="w-5 h-5 hover:text-red-500">
        <XCircleIcon />
      </button>
    </>
  );
}
