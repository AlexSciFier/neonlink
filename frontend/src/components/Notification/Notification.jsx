import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";

class Timer {
  remaining;
  resume = () => {};
  pause = () => {};

  constructor(callback, delay) {
    let timerId = -1,
      start = 0;
    this.remaining = delay;

    this.pause = () => {
      clearTimeout(timerId);
      this.remaining -= Date.now() - start;
    };

    this.resume = () => {
      start = Date.now();
      clearTimeout(timerId);
      timerId = setTimeout(callback, this.remaining);
    };

    this.resume();

    this.destroy = () => {
      clearTimeout(timerId);
    };
  }
}

/**
 *
 * @param {{
 * title?:string
 * type?:"error"|"warning"|"info"
 * message:string|React.ReactNode
 * onClose:Function
 * }} param0
 * @returns
 */
export default function Notification({
  title = "",
  type = "info",
  message,
  onClose,
}) {
  const timer = new Timer(onClose, 3000);
  timer.pause();

  useEffect(() => {
    timer.resume();

    return () => {
      timer.destroy();
    };
  }, []);

  let typeClass = "";
  switch (type) {
    case "error":
      typeClass = "bg-red-600";
      break;
    case "info":
      typeClass = "bg-cyan-600";
      break;
    case "warning":
      typeClass = "bg-amber-600";
      break;
    default:
      typeClass = "bg-cyan-600";
      break;
  }

  return (
    <div
      onMouseEnter={() => timer.pause()}
      onMouseLeave={() => timer.resume()}
      className={`flex px-8 py-4 rounded-lg text-white ${typeClass}`}
    >
      <div className="flex flex-col gap-3 flex-1">
        {title && <div className="text-lg font-medium">{title}</div>}
        <div>{message}</div>
      </div>
      <div>
        <XMarkIcon
          onClick={() => onClose()}
          className="w-5 h-5 cursor-pointer hover:bg-black/10 rounded-full"
        />
      </div>
    </div>
  );
}
