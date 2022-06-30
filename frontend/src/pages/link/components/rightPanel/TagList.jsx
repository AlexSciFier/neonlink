import React, { useEffect } from "react";
import { useTagsList } from "../../../../context/tagsList";
import TagItem from "./TagItem";

export default function TagList() {
  const { tags, fetchTags } = useTagsList();

  useEffect(() => {
    fetchTags();
  }, []);

  if (tags.length === 0) return <div>No tags</div>;
  return (
    <div className="flex flex-col">
      {tags.map((tag) => (
        <TagItem key={tag.id} tag={tag} />
      ))}
    </div>
  );
}
