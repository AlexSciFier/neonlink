import React from "react";

function BookmarkItem({ id, name, href, icon, isSelected, onChange }) {
  return (
    <li className={isSelected === false && "opacity-50 line-through"}>
      <label className="flex items-center gap-3">
        <input
          type={"checkbox"}
          checked={isSelected}
          onChange={() => onChange(id)}
        ></input>
        <div
          className="w-5 h-5 bg-cover flex-none"
          style={{ backgroundImage: `url(${icon})` }}
        ></div>
        <div className="flex flex-col flex-initial truncate">
          <div className="truncate">{name}</div>
          <div className="truncate font-light opacity-80">{href}</div>
        </div>
      </label>
    </li>
  );
}

export default function BookmarkList({ items, setItems, onImportClick }) {
  function handleListChange(id) {
    let selectedItem = items.filter((item) => item.id === id)[0];
    let selectedIdx = items.indexOf(selectedItem);
    let modifiedItems = [...items];
    modifiedItems[selectedIdx].isSelected = !items[selectedIdx].isSelected;
    setItems(modifiedItems);
  }

  function checkAll() {
    setItems(items.map((item) => ({ ...item, isSelected: true })));
  }
  function unCheckAll() {
    setItems(items.map((item) => ({ ...item, isSelected: false })));
  }
  return (
    <div>
      <div>Select the bookmarks you want to import</div>
      <ul className="flex flex-col gap-1 mt-3">
        <li>
          <label className="flex items-center gap-3">
            <input
              type={"checkbox"}
              defaultChecked={true}
              onClick={(e) => {
                e.target.checked ? checkAll() : unCheckAll();
              }}
            ></input>
            <div>Select All</div>
          </label>
        </li>
        {items.map((item) => (
          <BookmarkItem
            key={item.id}
            id={item.id}
            name={item.name}
            href={item.href}
            icon={item.icon}
            isSelected={item.isSelected}
            onChange={handleListChange}
          />
        ))}
      </ul>
      <button
        className="bg-cyan-500 text-white rounded px-4 py-2 mt-3"
        onClick={onImportClick}
      >
        Import
      </button>
    </div>
  );
}
