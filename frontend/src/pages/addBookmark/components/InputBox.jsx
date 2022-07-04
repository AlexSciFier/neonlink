import React from "react";
/**
 *
 * @param {{type:React.HTMLAttributes}} prop
 * @returns
 */
const InputBox = React.forwardRef(
  (
    {
      type,
      placeholder,
      onChange,
      value,
      name,
      refreshHandler,
      icon,
      isLoading,
      required = false,
    },
    ref
  ) => {
    return (
      <div className="relative">
        <input
          className="w-full rounded border focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          name={name}
          ref={ref}
          required={required}
        ></input>
        {refreshHandler ? (
          <button
            className={`text-gray-500 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded-full absolute right-2 top-1 ${
              isLoading ? "animate-spin" : ""
            }`}
            onClick={refreshHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        ) : null}
        {icon ? (
          <img
            className="absolute right-12 top-1"
            width={32}
            height={32}
            alt="icon"
            src={icon}
          />
        ) : null}
      </div>
    );
  }
);

export default InputBox;
