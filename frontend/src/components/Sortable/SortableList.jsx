import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import SortableItem from "./SortableItem";
import LazyIcon from "../LazyIcon";

export default function SortableList({ items, onDragEnd }) {
  const [itemsState, setItemsState] = useState(items);
  const [active, setActive] = useState(null);
  const activeItem = useMemo(
    () => itemsState.find((item) => item.id === active?.id),
    [active, itemsState]
  );

  useEffect(() => {
    setItemsState(items);
  }, [items]);

  function handleDragEnd(e) {
    const { active, over } = e;

    if (over && active.id !== over?.id) {
      const activeIndex = itemsState.findIndex(({ id }) => id === active.id);
      const overIndex = itemsState.findIndex(({ id }) => id === over.id);
      let movedArray = arrayMove(itemsState, activeIndex, overIndex);
      setItemsState(movedArray);
      let sortedArray = movedArray.map((item, idx) => {
        return { ...item, position: ++idx };
      });

      let idPositionPairArray = sortedArray.map((item) => {
        return { id: item.id, position: item.position };
      });
      onDragEnd(idPositionPairArray);
    }
  }
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
      sensors={sensors}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      onDragStart={({ active }) => {
        setActive(active);
      }}
    >
      <SortableContext
        items={itemsState}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {itemsState.map((item) => (
            <SortableItem key={item.id} item={item}>
              <div className="relative flex-none">
                <LazyIcon id={item.id} />
              </div>
              <div className="truncate flex-1">{item.title}</div>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <SortableItem item={activeItem} isActive={true}>
            <div className="relative flex-none">
              <LazyIcon id={activeItem.id} />
            </div>
            <div className="truncate flex-1">{activeItem.title}</div>
          </SortableItem>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
