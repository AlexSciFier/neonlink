import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppSettings } from "./context/settings/appSettings";
import { useIsloggedIn } from "./context/isLoggedIn";
import React, { useEffect } from "react";
import { APP_NAME } from "./helpers/constants";
import PrivateWrapper from "./components/PrivateWrapper";

const RegisterPage = React.lazy(() => import("./pages/register"));
const LoginPage = React.lazy(() => import("./pages/login"));

function App() {
  let { settingsError, fetchSettings } = useAppSettings();

  let { isProfileLoading, fetchProfile, setNeedRegistration } = useIsloggedIn();

  useEffect(() => {
    fetchSettings();
    document.title = APP_NAME;
  }, []);

  useEffect(() => {
    if (settingsError) {
      setNeedRegistration(true);
    } else {
      fetchProfile();
    }
  }, [settingsError]);

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
          <Route path="/*" element={<PrivateWrapper />} />
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
