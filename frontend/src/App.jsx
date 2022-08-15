import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useIsloggedIn } from "./context/isLoggedIn";
import { Navigate, Outlet } from "react-router";
import React, { useEffect } from "react";
import { getJSON } from "./helpers/fetch";
import { APP_NAME } from "./helpers/constants";

const RegisterPage = React.lazy(() => import("./pages/register"));
const Dashboard = React.lazy(() => import("./pages/dashboard"));
const NotFound = React.lazy(() => import("./pages/notFound"));
const EditBookmark = React.lazy(() => import("./pages/editBookmark"));
const AddPage = React.lazy(() => import("./pages/addBookmark"));
const SettingsPage = React.lazy(() => import("./pages/settings"));
const LinksPage = React.lazy(() => import("./pages/link"));
const LoginPage = React.lazy(() => import("./pages/login"));

function PrivateWrapper({ profile }) {
  return profile ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
  let {
    profile,
    setIsProfileLoading,
    isProfileLoading,
    setProfile,
    setNeedRegistration,
  } = useIsloggedIn();

  useEffect(() => {
    async function fetchProfile() {
      setIsProfileLoading(true);
      var res;
      setNeedRegistration(false);
      try {
        res = await getJSON("/api/users/me");
      } catch (error) {
        setProfile(undefined);
        setIsProfileLoading(false);
      }

      if (res.ok) {
        setProfile(await res.json());
        setIsProfileLoading(false);
      } else {
        if (res.status === 404) {
          setNeedRegistration(true);
        }
        setProfile(undefined);
        setIsProfileLoading(false);
      }
    }
    fetchProfile();
    document.title = APP_NAME;
  }, []);

  if (isProfileLoading) return <LoadScreen />;

  const routes = [
    { path: "/", element: <Dashboard /> },
    { path: "/settings", element: <SettingsPage /> },
    { path: "/add", element: <AddPage /> },
    { path: "/edit/:id", element: <EditBookmark /> },
    { path: "/links", element: <LinksPage /> },
  ];

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-cyan-600 to-fuchsia-600 overflow-auto dark:from-gray-900 dark:to-gray-900">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <React.Suspense fallback={<LoadScreen />}>
                <LoginPage />
              </React.Suspense>
            }
          />

          <Route
            path="/register"
            element={
              <React.Suspense fallback={<LoadScreen />}>
                <RegisterPage />
              </React.Suspense>
            }
          />

          {routes.map((route) => (
            <Route
              key={route.path}
              element={<PrivateWrapper profile={profile} />}
            >
              <Route
                path={route.path}
                element={
                  <React.Suspense fallback={<LoadScreen />}>
                    {route.element}
                  </React.Suspense>
                }
              />
            </Route>
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
      </Router>
    </div>
  );
}
function LoadScreen() {
  return (
    <div className="w-screen h-screen gradient-animate overflow-auto"></div>
  );
}
export default App;
