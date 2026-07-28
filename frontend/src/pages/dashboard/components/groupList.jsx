import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCategoriesList } from "../../../context/categoriesList";
import { getAllBookmarksWithCache, resetBookmarksCache } from "../../../helpers/bookmarkService";
import { useUserSettingsStore, userSettingsKeys } from "../../../stores/userSettingsStore";
import Group from "../components/group";
import { putJSON } from "../../../helpers/fetch";

export default function GroupList() {
  let { categories, isLoading, fetchCategories, abort } = useCategoriesList();

  const [columns] = useUserSettingsStore(userSettingsKeys.Columns);
  const [bookmarksByCategory, setBookmarksByCategory] = useState(null);
  const bookmarksAbort = useRef(null);

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

  const handleBookmarkDrop = async (bookmarkId, targetCategoryId) => {
    const sourceCategoryId = Object.keys(bookmarksByCategory).find((catId) =>
      bookmarksByCategory[catId].some((b) => b.id === bookmarkId)
    );
    if (!sourceCategoryId || sourceCategoryId === String(targetCategoryId)) return;

    const bookmark = bookmarksByCategory[sourceCategoryId].find(
      (b) => b.id === bookmarkId
    );
    if (!bookmark) return;

    setBookmarksByCategory((prev) => ({
      ...prev,
      [sourceCategoryId]: prev[sourceCategoryId].filter((b) => b.id !== bookmarkId),
      [targetCategoryId]: [...(prev[targetCategoryId] ?? []), { ...bookmark, categoryId: Number(targetCategoryId) }],
    }));

    const res = await putJSON(`/api/bookmarks/${bookmarkId}`, {
      url: bookmark.url,
      title: bookmark.title,
      desc: bookmark.desc,
      categoryId: Number(targetCategoryId),
    });

    if (!res.ok) {
      setBookmarksByCategory((prev) => ({
        ...prev,
        [sourceCategoryId]: [...prev[sourceCategoryId], bookmark],
        [targetCategoryId]: prev[targetCategoryId].filter((b) => b.id !== bookmarkId),
      }));
    } else {
      resetBookmarksCache();
    }
  };

  const handleReorder = (draggedId, targetId, categoryId) => {
    setBookmarksByCategory((prev) => {
      const list = [...(prev[categoryId] ?? [])]
      const fromIndex = list.findIndex((b) => b.id === draggedId)
      const toIndex = list.findIndex((b) => b.id === targetId)

      if(fromIndex < 0 || toIndex < 0) return prev;

      const [item] = list.splice(fromIndex, 1)
      list.splice(toIndex, 0, item)

      return {...prev, [categoryId]: list}
    })
  }

  const handleSaveOrder = async (categoryId) => {
    const list = bookmarksByCategory[categoryId]
    if(!list) return

    await putJSON(`/api/bookmarks/changePositions`, {
      categoryId: Number(categoryId),
      items: list.map((b, idx) => ({
        id: b.id,
        position: idx
      }))
    })

    resetBookmarksCache()
  }

  if (isLoading) return <div></div>;
  if (categories.length === 0) {
    return (
      <div className="w-fit self-center flex items-center gap-3 bg-white px-6 py-2 rounded shadow-xl dark:text-white dark:bg-gray-700 dark:shadow-cyan-500/10">
        <div className="h-10 w-10 text-fuchsia-600">
          <SquaresPlusIcon />
        </div>
        <div>
          <div className="text-xl">No groups.</div>
          <div>
            <Link to={"/settings#Groups"}>
              <span className="text-cyan-600 hover:text-cyan-800">Add group</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center w-full">
      <div
        className={`grid md:grid-cols-${columns} grid-cols-1 gap-4 justify-items-center md:w-2/3 w-11/12`}
      >
        {categories.map((category) => (
          <Group
            key={category.id}
            category={category}
            bookmarks={bookmarksByCategory?.[category.id] ?? []}
            isLoading={bookmarksByCategory === null}
            onBookmarkDrop={handleBookmarkDrop}
            onReorder={handleReorder}
            onSaveOrder={handleSaveOrder}
          />
        ))}
        <Link
          to={"/settings#Groups"}
          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 py-8 text-gray-400 dark:text-gray-500 hover:border-cyan-400 hover:text-cyan-400 dark:hover:border-cyan-400 dark:hover:text-cyan-400 transition-colors"
        >
          <SquaresPlusIcon className="w-8 h-8" />
          <span className="text-sm font-light">Add group</span>
        </Link>
      </div>
    </div>
  );
}
