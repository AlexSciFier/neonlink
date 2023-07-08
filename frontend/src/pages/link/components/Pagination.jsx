import React from "react";
import { useNavigate } from "react-router";
import { createSearchParams } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

function PaginationButton({ children, disabled, isCurrent, onClick }) {
  return (
    <button
      className={`p-2 w-10 h-10 rounded-full  ${
        disabled ? "pointer-events-none" : ""
      } ${
        isCurrent
          ? "bg-cyan-600 text-white hover:bg-cyan-400"
          : "hover:bg-gray-200"
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function Pagination({ lastPage, currentPage, siblings }) {
  const navigate = useNavigate();
  const isFirst = currentPage === 1;
  const isLast = currentPage === lastPage;

  function onNextClick(e) {
    e.preventDefault();
    let page = ++currentPage;
    navigate({
      pathname: "/links",
      search: `?${createSearchParams({ page })}`,
    });
  }

  function onPrevClick(e) {
    e.preventDefault();
    let page = --currentPage;
    navigate({
      pathname: "/links",
      search: `?${createSearchParams({ page })}`,
    });
  }

  function onPageClick(e) {
    e.preventDefault();
    let page = e.target.textContent;
    navigate({
      pathname: "/links",
      search: `?${createSearchParams({ page })}`,
    });
  }

  return (
    <div className="flex justify-center gap-3">
      <button
        className={`p-2 w-10 h-10 rounded-full text-gray-600 hover:bg-gray-200 ${
          isFirst ? "pointer-events-none" : ""
        }`}
        disabled={isFirst}
        onClick={onPrevClick}
      >
        <ChevronLeftIcon />
      </button>
      {range(lastPage, currentPage, siblings).map((value, idx) => (
        <PaginationButton
          isCurrent={value === currentPage}
          key={idx}
          onClick={onPageClick}
          disabled={value === "DOTS"}
        >
          {value === "DOTS" ? "..." : value}
        </PaginationButton>
      ))}
      <button
        className={`p-2 w-10 h-10 rounded-full text-gray-600 hover:bg-gray-200 ${
          isLast ? "pointer-events-none" : ""
        }`}
        disabled={isLast}
        onClick={onNextClick}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

function range(lastPage, currentPage, siblings) {
  const totalPageNumbers = siblings * 2 + 5;

  if (totalPageNumbers >= lastPage) {
    return [...Array(lastPage).keys()].map((idx) => ++idx);
  }
  let padedArray = [...Array(siblings * 2 + 1).keys()];

  let startArray = padedArray.map((idx) => {
    return idx + 1;
  });

  let centerArray = padedArray.map((idx) => {
    return idx + currentPage - siblings;
  });

  let endArray = padedArray.reverse().map((idx) => {
    return lastPage - idx;
  });

  if (currentPage <= 1 + siblings * 2 - 1) {
    return [...startArray, "DOTS", lastPage];
  }
  if (currentPage > lastPage - siblings * 2) {
    return [1, "DOTS", ...endArray];
  }
  return [1, "DOTS", ...centerArray, "DOTS", lastPage];
}
