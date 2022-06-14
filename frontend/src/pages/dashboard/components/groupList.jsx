import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCategoriesList } from "../../../context/categoriesList";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import Group from "../components/group";

export default function GroupList() {
  let { categories, isLoading, error, fetchCategories } = useCategoriesList();

  useEffect(() => {
    fetchCategories();
  }, []);

  const [columns] = useLocalStorage("dashboardColumns", 3);
  return (
    <div className="flex justify-center w-full">
      <div
        className={`grid md:grid-cols-${columns} grid-cols-1 gap-4 justify-items-center md:w-2/3 w-full`}
      >
        {categories.map((category) => (
          <Group key={category.id} category={category} />
        ))}
        {categories.length === 0 && (
          <div>
            <div className="text-xl dark:text-white">No groups.</div>
            <div>
              Add them in{" "}
              <Link to={"/settings"} className="text-cyan-600">
                settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
