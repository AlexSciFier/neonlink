import React, { useEffect } from "react";
import { useCategoriesList } from "../../../../context/categoriesList";
import InputGroup from "../../components/inputGroup";
import { AddCategoryInput } from "./AddCategoryInput";
import { arrayMove } from "@dnd-kit/sortable";
import SortableList from "./SortableList";

export default function GroupTab() {
  const {
    categories,
    setCategories,
    changePositions,
    isLoading,
    fetchCategories,
    abort,
  } = useCategoriesList();

  useEffect(() => {
    fetchCategories();
    return () => abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragEnd(e) {
    const { active, over } = e;

    if (active.id !== over.id) {
      setCategories((items) => {
        let activeItem = items.filter((item) => item.id === active.id)[0];
        let overItem = items.filter((item) => item.id === over.id)[0];
        const oldIndex = items.indexOf(activeItem);
        const newIndex = items.indexOf(overItem);
        let movedArray = arrayMove(items, oldIndex, newIndex);
        let sortedArray = movedArray.map((item, idx) => {
          return { ...item, position: ++idx };
        });

        let idPositionPairArray = sortedArray.map((item) => {
          return { id: item.id, position: item.position };
        });
        changePositions(idPositionPairArray);
        return sortedArray;
      });
    }
  }
  return (
    <div>
      <InputGroup title={"List of categories"}>
        <div>
          <AddCategoryInput />
          <div className="space-y-1 md:w-2/3 w-full">
            {isLoading ? (
              <div>Is Loading</div>
            ) : categories.length === 0 ? (
              "No categories"
            ) : (
              <SortableList handleDragEnd={handleDragEnd} items={categories} />
            )}
          </div>
        </div>
      </InputGroup>
    </div>
  );
}
