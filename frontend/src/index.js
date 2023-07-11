import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./fonts/Raleway-Light.ttf";
import "./fonts/Raleway-Medium.ttf";
import "./fonts/Raleway-Regular.ttf";
import App from "./App";
import { AppSettingsProvider } from "./context/settings/appSettings";
import { IsLoggedInProvider } from "./context/isLoggedIn";
import { UserSettingsProvider } from "./context/settings/userSettings";
import { CategoriesListProvider } from "./context/categoriesList";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppSettingsProvider>
      <IsLoggedInProvider>
        <UserSettingsProvider>
          <CategoriesListProvider>
            <App />
          </CategoriesListProvider>
        </UserSettingsProvider>
      </IsLoggedInProvider>
    </AppSettingsProvider>
  </React.StrictMode>
);
