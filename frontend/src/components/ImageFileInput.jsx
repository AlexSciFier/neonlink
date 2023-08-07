import React, { useEffect, useState } from "react";

export default function ImageFileInput({
  onChange,
  file,
  setFile,
  disabled,
  id,
  name,
}) {
  const [preview, setPreview] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function clearFile(e) {
    e.preventDefault();
    setFile(undefined);
  }

  /**
   *
   * @param {React.DragEvent<HTMLLabelElement>} e
   */
  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    setFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="w-full rounded border bg-transparent dark:text-white group-disabled:opacity-50">
      <label
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        htmlFor={id}
        className="cursor-pointer"
      >
        <input
          type={"file"}
          accept="image/*"
          id={id}
          name={name || id}
          placeholder={"Image file"}
          disabled={disabled}
          onChange={(e) => {
            setFile(e.target.files[0]);
            onChange(e.target.files[0]);
          }}
          className="hidden group"
        />
        <div
          className={`h-40 flex justify-center items-center rounded ${
            dragActive && "bg-black/10 dark:bg-white/10"
          } hover:bg-black/10 dark:hover:bg-white/10`}
        >
          {file ? (
            <img
              className="w-full h-full object-cover object-center"
              src={preview}
              alt=""
            ></img>
          ) : (
            "Click to select file or drag and drop image"
          )}
        </div>
      </label>
      {file && (
        <button
          className="bg-red-500 text-white rounded w-full py-2"
          onClick={(e) => {
            clearFile(e);
            onChange(undefined);
          }}
        >
          Clear image
        </button>
      )}
    </div>
  );
}
