import { PencilIcon, SelectorIcon, XIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { useCategoriesList } from "../../../../context/categoriesList";
import { ConfirmationButtons } from "./ConfirmationButtons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function CategoryItem({ id, name, color, position }) {
  const { deleteCategory, editCategory } = useCategoriesList();
  const [isEdit, setIsEdit] = useState(false);
  const [isDeleting, setIsDeliting] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedColor, setEditedColor] = useState(color);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function handleDelete() {
    await deleteCategory(id);
  }
  async function handleEdit() {
    let ok = await editCategory(id, editedName, editedColor, position);
    if (ok) {
      setIsEdit(false);
    }
  }
  if (isEdit)
    return (
      <li className="flex py-1 px-3 hover:bg-white/10 rounded">
        <input
          type={"text"}
          defaultValue={name}
          className="flex-1 bg-transparent ring ring-cyan-600 rounded mr-3"
          onChange={(e) => setEditedName(e.target.value)}
        ></input>
        <div className="flex items-center gap-1">
          <input
            type={"color"}
            defaultValue={color}
            className=""
            onChange={(e) => setEditedColor(e.target.value)}
          ></input>

          <ConfirmationButtons
            onConfirm={handleEdit}
            onCancel={() => setIsEdit(false)}
          />
        </div>
      </li>
    );

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex py-1 px-2 rounded cursor-default dark:bg-gray-900 bg-white active:shadow-xl active:ring-1 active:ring-white/10"
    >
      <div
        {...listeners}
        className="w-6 h-6 mr-2 rounded cursor-grab flex dark:hover:bg-white/10"
      >
        <SelectorIcon className="w-6 h-6" />
      </div>
      <div className={`flex-1 ${isDeleting ? "line-through" : ""}`}>{name}</div>
      <div className="flex items-center gap-1">
        <div
          className="w-5 h-5 rounded"
          style={{ backgroundColor: color }}
        ></div>
        {isDeleting ? (
          <ConfirmationButtons
            onConfirm={handleDelete}
            onCancel={() => setIsDeliting(false)}
          />
        ) : (
          <>
            <button
              onClick={(e) => setIsEdit(!isEdit)}
              className="w-5 h-5 hover:text-cyan-500"
            >
              <PencilIcon />
            </button>
            <button
              onClick={(e) => setIsDeliting(true)}
              className="w-5 h-5 hover:text-red-500"
            >
              <XIcon />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
