import React from "react";

export default function SwitchButton({ name, id, text, checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="flex items-center cursor-pointer gap-3">
        <div className="relative">
          <input
            id={id}
            name={name}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
          />
          <div className="block bg-gray-200 dark:bg-gray-800 w-12 h-6 rounded-full"></div>

          <div className="dot absolute w-4 h-4 bg-white peer-checked:bg-cyan-500 peer-checked:translate-x-6 rounded-full shadow left-1 top-1 transition"></div>
        </div>
        <div className="">{text}</div>
      </label>
    </div>
  );
}
