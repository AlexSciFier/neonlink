import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useIsloggedIn } from "./context/isLoggedIn";
import React, { useEffect } from "react";
import { getJSON } from "./helpers/fetch";
import { APP_NAME } from "./helpers/constants";
import PrivateWrapper from "./components/PrivateWrapper";

const RegisterPage = React.lazy(() => import("./pages/register"));
const LoginPage = React.lazy(() => import("./pages/login"));

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
          <Route path="/*" element={<PrivateWrapper profile={profile} />} />
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
