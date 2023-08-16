import React, { useEffect } from "react";
import { useState } from "react";
import Notification from "./Notification";

/**
 *
 * @param {{notify:Function}} param0
 * @returns
 */
export default function NotificationManager({ notify }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notify((title, message, type) => createNotification(title, message, type));
  }, [notify]);

  /**
   *
   * @param {string?} title
   * @param {string | React.ReactNode} message
   * @param {"error"|"warning"|"info"} type
   */
  function createNotification(title, message, type) {
    setNotifications((prev) => [
      ...prev,
      { id: (prev[prev.length - 1] || 0) + 1, title, message, type },
    ]);
  }

  /**
   *
   * @param {number} id
   */
  function deleteNotification(id) {
    setNotifications((prev) => {
      return prev.filter((notification) => notification.id !== id);
    });
  }

  return (
    <div className="fixed w-full sm:max-w-sm top-1 left-0 right-0 sm:left-5 flex flex-col gap-3">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          title={notification?.title}
          type={notification?.type}
          message={notification.message}
          onClose={() => deleteNotification(notification.id)}
        />
      ))}
    </div>
  );
}
