import React from "react";

export default function InputItem({ title, input, description, icon }) {
  return (
    <div className="flex items-center py-2">
      <div className="flex-none w-6 h-6 mr-3 hidden md:block opacity-70">
        {icon}
      </div>
      <div className="flex-1 md:basis-3/4 flex flex-col">
        <div className="">{title}</div>
        <div className="opacity-50 hidden md:block">{description}</div>
      </div>
      <div className="flex-1 md:basis-1/4 flex justify-end">{input}</div>
    </div>
  );
}
