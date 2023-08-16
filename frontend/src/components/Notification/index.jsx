import NotificationManager from "./NotificationManager";
import { createRoot } from "react-dom/client";

const portalId = "notifyContainer";
let container = document.getElementById(portalId);

if (container == null) {
  container = document.createElement("div");
  container.setAttribute("id", portalId);
  document.body.appendChild(container);
}

/**
 *
 * @param {string?} title
 * @param {string | React.ReactNode} message
 * @param {"error"|"warning"|"info"} type
 */
let notify = (title, message, type) => {};
const root = createRoot(container);
root.render(
  <NotificationManager
    notify={(notifyFn) => {
      notify = notifyFn;
    }}
  />
);

export { notify };
