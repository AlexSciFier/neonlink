import { SelectorIcon } from "@heroicons/react/outline";
import React from "react";
import { useEffect, useState, useRef } from "react";

export default function SelectInputColor({
  options,
  onChange,
  defaultValue,
  value,
}) {
  const ref = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (isMenuOpen && ref.current && !ref.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  function handleSelect(selectedItem) {
    setSelected(selectedItem);
    setIsMenuOpen(false);
    onChange(selectedItem);
  }

  return (
    <div ref={ref} className="relative">
      <button
        className="h-full px-3 border rounded flex gap-1 items-center"
        onClick={(e) => setIsMenuOpen(!isMenuOpen)}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: selected.value }}
        ></span>
        <span>{selected.label}</span>
        <SelectorIcon className="w-5 h-5" />
      </button>
      {isMenuOpen && (
        <ul className="absolute left-0 right-0 mt-1 bg-white text-black py-1 rounded shadow-xl dark:bg-gray-900 dark:text-white dark:border">
          {options.map((option, idx) => (
            <li
              key={idx}
              className="cursor-pointer hover:bg-cyan-500 px-3 flex items-center gap-1"
              onClick={() => handleSelect(option)}
            >
              <span
                style={{ backgroundColor: option.value }}
                className="w-3 h-3 rounded-full"
              ></span>
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
