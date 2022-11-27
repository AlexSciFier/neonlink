import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { BookMarkListProvider } from "../../../../context/bookmarkList";
import { CategoryItem } from "./CategoryItem";

export default function SortableList({ handleDragEnd, items }) {
  const [active, setActive] = useState(null);
  const activeItem = useMemo(
    () => items.find((item) => item.id === active?.id),
    [active, items]
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  return (
    <DndContext
      onDragEnd={handleDragEnd}
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={({ active }) => {
        setActive(active);
      }}
    >
      <BookMarkListProvider>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-3">
            {items?.map((category) => (
              <CategoryItem
                id={category.id}
                name={category.name}
                color={category.color}
                position={category.position}
                key={category.id}
              />
            ))}
          </ul>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <CategoryItem
              id={activeItem.id}
              name={activeItem.name}
              color={activeItem.color}
              position={activeItem.position}
              isActive={true}
            />
          ) : null}
        </DragOverlay>
      </BookMarkListProvider>
    </DndContext>
  );
}
