import React from "react";
import { useNavigate } from "react-router";
import { createSearchParams } from "react-router-dom";

function ChevronLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

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

export default function Pagination({ maxPage, currentPage, siblings }) {
  const navigate = useNavigate();
  const isFirst = currentPage === 1;
  const isLast = currentPage === maxPage;

  function onNextClick(e) {
    e.preventDefault();
    let page = ++currentPage;
    navigate({ pathname: "/", search: `?${createSearchParams({ page })}` });
  }

  function onPrevClick(e) {
    e.preventDefault();
    let page = --currentPage;
    navigate({ pathname: "/", search: `?${createSearchParams({ page })}` });
  }

  function onPageClick(e) {
    e.preventDefault();
    let page = e.target.textContent;
    navigate({ pathname: "/", search: `?${createSearchParams({ page })}` });
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
        <ChevronLeft />
      </button>
      {range(maxPage, currentPage, siblings).map((value, idx) => (
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
        <ChevronRight />
      </button>
    </div>
  );
}

function range(maxPage, currentPage, siblings) {
  const totalPageNumbers = siblings * 2 + 5;

  if (totalPageNumbers >= maxPage) {
    return [...Array(maxPage).keys()].map((idx) => ++idx);
  }
  let centerArray = [...Array(siblings * 2 + 1).keys()];
  centerArray = centerArray.map((idx) => {
    return idx + currentPage - siblings;
  });
  return [1, "DOTS", ...centerArray, "DOTS", maxPage];
}
