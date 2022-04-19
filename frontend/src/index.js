import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { IsLoggedInProvider } from "./context/isLoggedIn";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <IsLoggedInProvider>
      <App />
    </IsLoggedInProvider>
  </React.StrictMode>
);
