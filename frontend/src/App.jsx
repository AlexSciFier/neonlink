import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login";
import MainPage from "./pages/main";
import { useIsloggedIn } from "./context/isLoggedIn";
import SettingsPage from "./pages/settings";
import AddPage from "./pages/addBookmark";
import { Navigate, Outlet } from "react-router";
import { useEffect } from "react";
import { getJSON } from "./helpers/fetch";
import EditBookmark from "./pages/editBookmark";
import NotFound from "./pages/notFound";
import Dashboard from "./pages/dashboard";
import RegisterPage from "./pages/register";
import { APP_NAME } from "./helpers/constants";

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

  if (isProfileLoading)
    return (
      <div className="w-screen h-screen gradient-animate overflow-auto"></div>
    );

  const routes = [
    { path: "/", element: <Dashboard /> },
    { path: "/settings", element: <SettingsPage /> },
    { path: "/add", element: <AddPage /> },
    { path: "/edit/:id", element: <EditBookmark /> },
    { path: "/links", element: <MainPage /> },
  ];

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-cyan-600 to-fuchsia-600 overflow-auto dark:from-gray-900 dark:to-gray-900">
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          {routes.map((route) => (
            <Route
              key={route.path}
              element={<PrivateWrapper profile={profile} />}
            >
              <Route path={route.path} element={route.element} />
            </Route>
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
