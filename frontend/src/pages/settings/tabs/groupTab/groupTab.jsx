import React, { useEffect } from "react";
import { useCategoriesList } from "../../../../context/categoriesList";
import InputGroup from "../../components/inputGroup";
import { AddCategoryInput } from "./AddCategoryInput";
import { CategoryItem } from "./CategoryItem";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

export default function GroupTab() {
  const {
    categories,
    setCategories,
    changePositions,
    isLoading,
    error,
    fetchCategories,
  } = useCategoriesList();

  useEffect(() => {
    fetchCategories();
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
        <AddCategoryInput />
        <ul className="space-y-1 md:w-2/3 xl:w-1/4 w-full">
          {isLoading ? (
            <div>Is Loading</div>
          ) : categories.length === 0 ? (
            "No categories"
          ) : (
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext
                items={categories}
                strategy={verticalListSortingStrategy}
              >
                {categories?.map((category) => (
                  <CategoryItem
                    id={category.id}
                    name={category.name}
                    color={category.color}
                    position={category.position}
                    key={category.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </ul>
      </InputGroup>
    </div>
  );
}
