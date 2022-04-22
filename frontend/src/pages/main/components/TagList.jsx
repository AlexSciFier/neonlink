import React, { useEffect } from "react";
import { useTagsList } from "../../../context/tagsList";

export default function TagList() {
  const { tags, fetchTags } = useTagsList();

  useEffect(() => {
    fetchTags();
  }, []);

  if (tags.length === 0) return <div>No tags</div>;
  return (
    <div>
      {tags.map((tag) => (
        <div key={tag.id}>{tag.name}</div>
      ))}
    </div>
  );
}
