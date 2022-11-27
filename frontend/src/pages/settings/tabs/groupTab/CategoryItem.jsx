import { PencilIcon, SelectorIcon, XIcon } from "@heroicons/react/outline";
import React, { useEffect, useState } from "react";
import { useCategoriesList } from "../../../../context/categoriesList";
import { ConfirmationButtons } from "./ConfirmationButtons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getJSON } from "../../../../helpers/fetch";
import SortableList from "../../../../components/Sortable/SortableList";
import { useBookMarkList } from "../../../../context/bookmarkList";

export function CategoryItem({ id, name, color, position, isActive = false }) {
  const { deleteCategory, editCategory } = useCategoriesList();
  const [isEdit, setIsEdit] = useState(false);
  const [isDeleting, setIsDeliting] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedColor, setEditedColor] = useState(color);
  const [bookmarks, setBookmarks] = useState([]);

  const { changePositions } = useBookMarkList();

  useEffect(() => {
    const fetch = async () => {
      let res = await getJSON("/api/bookmarks/category/" + id);
      if (res.ok) {
        setBookmarks(await res.json());
      }
    };
    fetch();
  }, [id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
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
      className={`flex flex-col gap-3 py-1 px-2 rounded cursor-default border dark:bg-gray-900 bg-white transition-shadow ${
        isActive ? "shadow-xl ring-1 ring-white/10 z-50" : ""
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex w-full justify-between">
        <div
          {...listeners}
          ref={setActivatorNodeRef}
          className={`w-6 h-6 mr-2 rounded ${
            isActive ? "cursor-grabbing" : "cursor-grab"
          } flex dark:hover:bg-white/10`}
        >
          <SelectorIcon className="w-6 h-6" />
        </div>
        <div className={`flex-1 ${isDeleting ? "line-through" : ""}`}>
          {name}
        </div>
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
      </div>
      <div className="px-7 mb-3">
        <SortableList
          items={bookmarks}
          onDragEnd={(items) => {
            console.log({ items, categoryId: id });
            changePositions({ items, categoryId: id });
          }}
        />
      </div>
    </li>
  );
}
