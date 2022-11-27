import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ item, isActive = false, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <div
      {...listeners}
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-3 border p-1 rounded bg-white dark:bg-gray-900 dark:text-white transition-shadow ${
        isActive ? "shadow-xl z-50 cursor-grabbing" : "cursor-grab"
      } ${isDragging ? "opacity-40" : ""}`}
    >
      {children}
    </div>
  );
}
