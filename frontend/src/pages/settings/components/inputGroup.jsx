import React from "react";

export default function InputGroup({ title, children }) {
  return (
    <div>
      <h2 className="text-2xl font-light mb-3">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
