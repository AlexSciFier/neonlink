import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { IsLoggedInProvider } from "./context/isLoggedIn";
import { ThemeProvider } from "./context/themeContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <IsLoggedInProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </IsLoggedInProvider>
  </React.StrictMode>
);
