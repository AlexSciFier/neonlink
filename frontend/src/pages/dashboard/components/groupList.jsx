import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useCategoriesList } from "../../../context/categoriesList";
import {
  getAllBookmarksWithCache,
  resetBookmarksCache,
} from "../../../helpers/bookmarkService";
import {
  useUserSettingsStore,
  userSettingsKeys,
} from "../../../stores/userSettingsStore";
import Group from "../components/group";
import LazyIcon from "../../../components/LazyIcon";
import { putJSON } from "../../../helpers/fetch";

export default function GroupList() {
  let { categories, isLoading, fetchCategories, abort, deleteCategory } =
    useCategoriesList();

  const [columns] = useUserSettingsStore(userSettingsKeys.Columns);
  const [dashboardEditMode, setDashboardEditMode] = useUserSettingsStore(
    userSettingsKeys.DashboardEditMode
  );
  const [localCats, setLocalCats] = useState([]);
  const [bookmarksByCategory, setBookmarksByCategory] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeDragRect, setActiveDragRect] = useState(null);
  // { overCatId, side: "left" | "right" } — where a dragged group will land
  const [groupDrop, setGroupDrop] = useState(null);
  const sourceContainerRef = useRef(null);
  const bookmarksAbort = useRef(null);

  useEffect(() => {
    setLocalCats(categories ?? []);
  }, [categories]);

  useEffect(() => {
    fetchCategories();

    bookmarksAbort.current = new AbortController();
    getAllBookmarksWithCache(bookmarksAbort.current.signal)
      .then((all) => {
        const grouped = {};
        for (const b of all) {
          (grouped[b.categoryId] ??= []).push(b);
        }
        for (const k in grouped) {
          grouped[k].sort(
            (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
          );
        }
        setBookmarksByCategory(grouped);
      })
      .catch(() => setBookmarksByCategory({}));

    return () => {
      abort();
      bookmarksAbort.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const bmMap = bookmarksByCategory ?? {};

  // Stable identity for the group SortableContext (see the same note in group.jsx).
  const groupIds = useMemo(() => localCats.map((c) => "g" + c.id), [localCats]);

  // Resolve a dnd id ("g<catId>" or "b<bookmarkId>") to its container id "g<catId>".
  function findContainer(id) {
    if (id == null) return null;
    const s = String(id);
    if (s.startsWith("g")) return s;
    const bmId = Number(s.slice(1));
    for (const catId in bmMap) {
      if (bmMap[catId].some((b) => b.id === bmId)) return "g" + catId;
    }
    return null;
  }

  function handleDragStart({ active }) {
    setActiveId(active.id);
    setActiveDragRect(active.rect.current?.initial ?? null);
    sourceContainerRef.current = findContainer(active.id);
  }

  // Live-move a bookmark between groups while dragging.
  function handleDragOver({ active, over }) {
    if (!over) return;

    // Group drag: no live move — just compute the drop indicator position.
    if (String(active.id).startsWith("g")) {
      const overContainer = findContainer(over.id);
      if (!overContainer || overContainer === String(active.id)) {
        setGroupDrop(null);
        return;
      }
      const activeIndex = localCats.findIndex(
        (c) => "g" + c.id === String(active.id)
      );
      const overIndex = localCats.findIndex(
        (c) => "g" + c.id === overContainer
      );
      // Moving forward (from before the target) → lands to the target's right.
      const side = activeIndex < overIndex ? "right" : "left";
      setGroupDrop({ overCatId: overContainer.slice(1), side });
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    )
      return;

    setBookmarksByCategory((prev) => {
      const activeCat = activeContainer.slice(1);
      const overCat = overContainer.slice(1);
      const activeItems = prev[activeCat] ?? [];
      const overItems = prev[overCat] ?? [];
      const bmId = Number(String(active.id).slice(1));
      const movingIndex = activeItems.findIndex((b) => b.id === bmId);
      if (movingIndex < 0) return prev;
      const moving = activeItems[movingIndex];

      let newIndex;
      if (String(over.id).startsWith("g")) {
        newIndex = overItems.length;
      } else {
        const overId = Number(String(over.id).slice(1));
        const overIndex = overItems.findIndex((b) => b.id === overId);
        newIndex = overIndex >= 0 ? overIndex : overItems.length;
      }

      return {
        ...prev,
        [activeCat]: activeItems.filter((b) => b.id !== bmId),
        [overCat]: [
          ...overItems.slice(0, newIndex),
          { ...moving, categoryId: Number(overCat) },
          ...overItems.slice(newIndex),
        ],
      };
    });
  }

  async function persistBookmarkOrder(catId, list) {
    await putJSON(`/api/bookmarks/changePositions`, {
      categoryId: Number(catId),
      items: list.map((b, idx) => ({ id: b.id, position: idx })),
    });
  }

  async function handleDragEnd({ active, over }) {
    const activeIdStr = String(active.id);
    setActiveId(null);
    setGroupDrop(null);
    const sourceContainer = sourceContainerRef.current;
    sourceContainerRef.current = null;

    // ---------- GROUP reorder ----------
    if (activeIdStr.startsWith("g")) {
      const overContainer = over ? findContainer(over.id) : null;
      if (!overContainer || overContainer === activeIdStr) return;
      const oldIndex = localCats.findIndex((c) => "g" + c.id === activeIdStr);
      const newIndex = localCats.findIndex((c) => "g" + c.id === overContainer);
      if (oldIndex < 0 || newIndex < 0) return;
      const moved = arrayMove(localCats, oldIndex, newIndex);
      setLocalCats(moved);
      await putJSON(
        `/api/categories/changePositions`,
        moved.map((c, idx) => ({ id: c.id, position: idx + 1 }))
      );
      return;
    }

    // ---------- BOOKMARK reorder / cross-group move ----------
    const finalContainer = findContainer(active.id);
    if (!finalContainer) return;
    const finalCat = finalContainer.slice(1);
    const bmId = Number(activeIdStr.slice(1));

    const list = [...(bmMap[finalCat] ?? [])];
    const oldIndex = list.findIndex((b) => b.id === bmId);
    let newIndex;
    if (!over || String(over.id).startsWith("g")) {
      newIndex = list.length - 1;
    } else {
      newIndex = list.findIndex((b) => b.id === Number(String(over.id).slice(1)));
      if (newIndex < 0) newIndex = list.length - 1;
    }
    const finalList =
      oldIndex >= 0 ? arrayMove(list, oldIndex, newIndex) : list;

    const crossGroup = sourceContainer && sourceContainer !== finalContainer;
    const srcCat = crossGroup ? sourceContainer.slice(1) : null;
    const srcList = crossGroup ? bmMap[srcCat] ?? [] : null;

    setActiveDragRect(null);
    setBookmarksByCategory((prev) => ({ ...prev, [finalCat]: finalList }));

    if (crossGroup) {
      const moved = finalList.find((b) => b.id === bmId);
      if (moved) {
        await putJSON(`/api/bookmarks/${bmId}`, {
          url: moved.url,
          title: moved.title,
          desc: moved.desc,
          categoryId: Number(finalCat),
        });
      }
      await persistBookmarkOrder(finalCat, finalList);
      await persistBookmarkOrder(srcCat, srcList);
    } else {
      await persistBookmarkOrder(finalCat, finalList);
    }
    resetBookmarksCache();
  }

  function handleDragCancel() {
    setActiveId(null);
    setActiveDragRect(null);
    setGroupDrop(null);
    sourceContainerRef.current = null;
  }

  // ----- drag overlay preview -----
  const activeIsGroup = activeId != null && String(activeId).startsWith("g");
  const activeBookmark =
    activeId != null && !activeIsGroup
      ? Object.values(bmMap)
          .flat()
          .find((b) => "b" + b.id === String(activeId))
      : null;
  const activeCategory = activeIsGroup
    ? localCats.find((c) => "g" + c.id === String(activeId))
    : null;

  if (isLoading) return <div></div>;
  if (localCats.length === 0) {
    return (
      <div className="w-fit self-center flex items-center gap-3 bg-white px-6 py-2 rounded shadow-xl dark:text-white dark:bg-gray-700 dark:shadow-cyan-500/10">
        <div className="h-10 w-10 text-fuchsia-600">
          <SquaresPlusIcon />
        </div>
        <div>
          <div className="text-xl">No groups.</div>
          <div>
            <Link to={"/settings#Groups"}>
              <span className="text-cyan-600 hover:text-cyan-800">
                Add group
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-2">
      <div className="flex md:w-2/3 w-11/12 justify-end">
        <button
          onClick={() => setDashboardEditMode(!dashboardEditMode)}
          title={dashboardEditMode ? "Exit edit mode" : "Edit dashboard"}
          className="flex items-center gap-2 group"
        >
          <span className="text-sm text-gray-400 dark:text-gray-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
            Edit dashboard
          </span>
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              dashboardEditMode
                ? "bg-cyan-500"
                : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                dashboardEditMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </span>
        </button>
      </div>

      <div className="flex justify-center w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            className={`grid md:grid-cols-${columns} grid-cols-1 gap-4 justify-items-center md:w-2/3 w-11/12`}
          >
            <SortableContext items={groupIds} strategy={rectSortingStrategy}>
              {localCats.map((category) => (
                <Group
                  key={category.id}
                  category={category}
                  bookmarks={bookmarksByCategory?.[category.id] ?? []}
                  isLoading={bookmarksByCategory === null}
                  dropIndicator={
                    groupDrop &&
                    String(groupDrop.overCatId) === String(category.id)
                      ? groupDrop.side
                      : null
                  }
                  onDelete={() => deleteCategory(category.id)}
                />
              ))}
            </SortableContext>
            {dashboardEditMode && (
              <Link
                to={"/settings#Groups"}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 py-8 text-gray-400 dark:text-gray-500 hover:border-cyan-400 hover:text-cyan-400 dark:hover:border-cyan-400 dark:hover:text-cyan-400 transition-colors"
              >
                <SquaresPlusIcon className="w-8 h-8" />
                <span className="text-sm font-light">Add group</span>
              </Link>
            )}
          </div>

          <DragOverlay>
            {activeBookmark ? (
              <div className="bookmark">
                <div className="flex items-center space-x-3 px-4 py-2 rounded shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10">
                  <div className="flex-none relative">
                    <LazyIcon
                      id={activeBookmark.id}
                      title={activeBookmark.title}
                      updatedAt={activeBookmark.updated_at}
                    />
                  </div>
                  <div className="truncate dark:text-white">
                    {activeBookmark.title}
                  </div>
                </div>
              </div>
            ) : activeCategory ? (
              <div
                className="rounded-lg shadow-2xl"
                style={{
                  width: activeDragRect?.width,
                  height: activeDragRect?.height,
                  backgroundColor: activeCategory.color + "cc",
                  border: `2px solid ${activeCategory.color}`,
                }}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
