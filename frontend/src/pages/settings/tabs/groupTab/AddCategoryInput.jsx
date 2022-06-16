import { PlusIcon } from "@heroicons/react/outline";
import React, { useRef, useState } from "react";
import SelectInputColor from "../../../../components/SelectInputColor";
import { useCategoriesList } from "../../../../context/categoriesList";
import { colors, getRandomColor } from "../../../../helpers/color";

export function AddCategoryInput() {
  const { addCategory } = useCategoriesList();
  const [color, setColor] = useState(getRandomColor());

  const nameRef = useRef(null);

  async function handleSubmit() {
    await addCategory(nameRef.current.value, color.value);
    nameRef.current.value = "";
    setColor(getRandomColor());
  }

  return (
    <div className="flex mb-3 md:w-2/3 xl:w-1/4 w-full gap-1">
      <input
        type={"text"}
        ref={nameRef}
        className="bg-transparent flex-1 w-0 disabled:text-gray-400 rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4"
      ></input>
      {/* <div style={{ backgroundColor: color }}>
        <input
          className="overflow-hidden opacity-0"
          type={"color"}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        ></input>
      </div> */}
      <SelectInputColor
        options={colors}
        value={color}
        onChange={(color) => setColor(color)}
      />
      <button
        className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 rounded"
        onClick={handleSubmit}
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
