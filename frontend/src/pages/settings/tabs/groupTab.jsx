import {
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  XCircleIcon,
  XIcon,
} from "@heroicons/react/outline";
import React, { useEffect, useRef, useState } from "react";
import { useCategoriesList } from "../../../context/categoriesList";
import InputGroup from "../components/inputGroup";

function AddCategoryInput() {
  const { addCategory } = useCategoriesList();
  var randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const [color, setColor] = useState(`#${randomColor}`);

  const nameRef = useRef(null);

  function handleSubmit() {
    addCategory(nameRef.current.value, color);
    nameRef.current.value = "";
  }

  return (
    <div className="flex mb-3">
      <input
        type={"text"}
        ref={nameRef}
        className="bg-transparent flex-1 disabled:text-gray-400 rounded-l border border-r-0 focus:outline-none focus:ring-cyan-600 focus:ring px-4"
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
  const { deleteCategory } = useCategoriesList();
  const [isEdit, setIsEdit] = useState(false);

  function handleDelete() {
    deleteCategory(id);
  }

  if (isEdit)
    return (
      <li className="flex py-1 px-3 hover:bg-white/10 rounded">
        <input
          type={"text"}
          defaultValue={name}
          className="flex-1 bg-transparent"
        ></input>
        <div className="flex items-center gap-1">
          <div
            className="w-5 h-5 rounded"
            style={{ backgroundColor: color }}
          ></div>

          <button className="w-5 h-5 hover:text-green-500">
            <CheckCircleIcon />
          </button>
          <button
            onClick={(e) => setIsEdit(false)}
            className="w-5 h-5 hover:text-red-500"
          >
            <XCircleIcon />
          </button>
        </div>
      </li>
    );

  return (
    <li className="flex py-1 px-3 hover:bg-white/10 rounded">
      <div className="flex-1">{name}</div>
      <div className="flex items-center gap-1">
        <div
          className="w-5 h-5 rounded"
          style={{ backgroundColor: color }}
        ></div>
        <button
          onClick={(e) => setIsEdit(!isEdit)}
          className="w-5 h-5 hover:text-cyan-500"
        >
          <PencilIcon />
        </button>
        <button onClick={handleDelete} className="w-5 h-5 hover:text-red-500">
          <XIcon />
        </button>
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
        <ul className="space-y-1 w-1/4">
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
