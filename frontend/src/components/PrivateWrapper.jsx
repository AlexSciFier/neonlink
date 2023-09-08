import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import NavBar from "./NavBar";
import {
  useUserCurrentStore,
  userCurrentKeys,
} from "../stores/userCurrentStore";
import {
  appSettingsKeys,
  useAppSettingsStore,
} from "../stores/appSettingsStore";

const Dashboard = React.lazy(() => import("../pages/dashboard"));
const NotFound = React.lazy(() => import("../pages/notFound"));
const EditBookmark = React.lazy(() => import("../pages/editBookmark"));
const AddPage = React.lazy(() => import("../pages/addBookmark"));
const SettingsPage = React.lazy(() => import("../pages/settings"));
const LinksPage = React.lazy(() => import("../pages/link"));

const routes = [
  { path: "/", element: <Dashboard /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/add", element: <AddPage /> },
  { path: "/edit/:id", element: <EditBookmark /> },
  { path: "/links", element: <LinksPage /> },
];

export default function PrivateWrapper() {
  const [authenticationEnabled] = useAppSettingsStore(
    appSettingsKeys.AuthenticationEnabled
  );
  const [forceRegistration] = useAppSettingsStore(
    appSettingsKeys.ForceRegistration
  );
  const [authenticated] = useUserCurrentStore(userCurrentKeys.Authenticated);
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (forceRegistration) navigate("/register");
    else if (authenticationEnabled && !authenticated) navigate("/login");
    else navigate(pathname + hash + search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, authenticationEnabled, forceRegistration]);

  return (
    <>
      {pathname !== "/" && <NavBar />}
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <React.Suspense fallback={<LoadScreen />}>
                {route.element}
              </React.Suspense>
            }
          />
        ))}
        <Route
          path="*"
          element={
            <React.Suspense fallback={<LoadScreen />}>
              <NotFound />
            </React.Suspense>
          }
        />
      </Routes>
    </>
  );
}
function LoadScreen() {
  // gradient-animate
  return (
    // <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-fuchsia-600 dark:from-gray-900 dark:to-gray-900 overflow-auto"></div>
    <div></div>
  );
}
