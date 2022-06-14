import {
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  XCircleIcon,
  XIcon,
} from "@heroicons/react/outline";
import React, { useEffect, useRef, useState } from "react";
import { useCategoriesList } from "../../../context/categoriesList";
import { getRandomColor } from "../../../helpers/color";
import InputGroup from "../components/inputGroup";

function ConfirmationButtons({ onConfirm, onCancel }) {
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

function AddCategoryInput() {
  const { addCategory } = useCategoriesList();
  const [color, setColor] = useState(getRandomColor());

  const nameRef = useRef(null);

  async function handleSubmit() {
    await addCategory(nameRef.current.value, color);
    nameRef.current.value = "";
    setColor(getRandomColor());
  }

  return (
    <div className="flex mb-3">
      <input
        type={"text"}
        ref={nameRef}
        className="bg-transparent flex-1 w-0 disabled:text-gray-400 rounded-l border border-r-0 focus:outline-none focus:ring-cyan-600 focus:ring px-4"
      ></input>
      <div style={{ backgroundColor: color }}>
        <input
          className="overflow-hidden opacity-0"
          type={"color"}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        ></input>
      </div>
      <button
        className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 rounded-r"
        onClick={handleSubmit}
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

function CategoryItem({ id, name, color }) {
  const { deleteCategory, editCategory } = useCategoriesList();
  const [isEdit, setIsEdit] = useState(false);
  const [isDeleting, setIsDeliting] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedColor, setEditedColor] = useState(color);

  async function handleDelete() {
    await deleteCategory(id);
  }
  async function handleEdit() {
    let ok = await editCategory(id, editedName, editedColor);
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
    <li className="flex py-1 px-3 hover:bg-white/10 rounded">
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

export default function GroupTab() {
  const { categories, isLoading, error, fetchCategories } = useCategoriesList();

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <InputGroup title={"List of categories"}>
        <ul className="space-y-1 md:w-2/3 xl:w-1/4 w-full">
          <AddCategoryInput />
          {isLoading ? (
            <div>Is Loading</div>
          ) : categories.length === 0 ? (
            "No categories"
          ) : (
            categories?.map((category) => (
              <CategoryItem
                id={category.id}
                name={category.name}
                color={category.color}
                key={category.id}
              />
            ))
          )}
        </ul>
      </InputGroup>
    </div>
  );
}
