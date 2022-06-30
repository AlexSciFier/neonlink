import React from "react";

export default function RadioButtonGroup({
  options,
  name,
  title,
  onChange,
  defaultValue,
}) {
  return (
    <div className="flex flex-col">
      <p>{title}</p>
      {options.map((option) => (
        <div>
          <input
            className="checkbox hidden"
            type={"radio"}
            id={`${name}-${option}`}
            name={name}
            value={option}
            onChange={onChange}
            checked={defaultValue === option}
          />
          <label htmlFor={`${name}-${option}`} className="flex items-center">
            <span className="radio w-4 h-4 inline-block mr-1 rounded-full border border-grey transition-colors"></span>
            <span className="capitalize">{option}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
