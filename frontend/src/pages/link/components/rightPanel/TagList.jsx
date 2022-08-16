import React, { useEffect } from "react";
import { useTagsList } from "../../../../context/tagsList";
import TagItem from "./TagItem";

export default function TagList() {
  const { tags, fetchTags, abort } = useTagsList();

  useEffect(() => {
    fetchTags();
    return () => abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
