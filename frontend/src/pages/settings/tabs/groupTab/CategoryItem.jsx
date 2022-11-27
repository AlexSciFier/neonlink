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

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex flex-col gap-3 py-1 px-2 rounded cursor-default border dark:bg-gray-900 bg-white transition-shadow ${
        isActive ? "shadow-xl ring-1 ring-white/10 z-50" : ""
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex w-full justify-between py-2">
        <div
          {...listeners}
          ref={setActivatorNodeRef}
          className={`w-6 h-6 mr-2 rounded ${
            isActive ? "cursor-grabbing" : "cursor-grab"
          } flex dark:hover:bg-white/10`}
        >
          <SelectorIcon className="w-6 h-6" />
        </div>
        <Header id={id} name={name} color={color} position={position} />
      </div>
      <div className="px-7 mb-3">
        {bookmarks.length > 0 ? (
          <SortableList
            items={bookmarks}
            onDragEnd={(items) => {
              changePositions({ items, categoryId: id });
            }}
          />
        ) : (
          <div className="text-center uppercase text-neutral-600 dark:text-neutral-200">Empty</div>
        )}
      </div>
    </li>
  );
}

function Header({ id, name, color, position }) {
  const [isDeleting, setIsDeliting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedColor, setEditedColor] = useState(color);

  const { deleteCategory, editCategory } = useCategoriesList();

  async function handleEdit() {
    let ok = await editCategory(id, editedName, editedColor, position);
    if (ok) {
      setIsEdit(false);
    }
  }

  async function handleDelete() {
    await deleteCategory(id);
  }

  return (
    <div className="flex justify-between flex-1 items-center">
      {isEdit ? (
        <input
          type={"text"}
          defaultValue={name}
          className="flex-1 bg-transparent ring ring-cyan-600 rounded mr-3"
          onChange={(e) => setEditedName(e.target.value)}
        ></input>
      ) : (
        <div
          className={`flex-1 text-lg font-medium ${
            isDeleting ? "line-through" : ""
          }`}
        >
          {name}
        </div>
      )}

      {isEdit ? (
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
      ) : (
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
      )}
    </div>
  );
}
