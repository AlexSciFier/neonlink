import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import PrivateWrapper from "./components/PrivateWrapper";
import {
  appMainStoreKeys,
  appMainStoreInitialState,
  useAppMainStore,
} from "./stores/appMainStore";
import { fetchAppSettings } from "./stores/appSettingsStore";
import { fetchCurrentUser } from "./stores/userCurrentStore";
import { fetchUserSettings } from "./stores/userSettingsStore";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const RegisterPage = React.lazy(() => import("./pages/register"));
const LoginPage = React.lazy(() => import("./pages/login"));

function App() {
  const [isErrored, setIsErrored] = useAppMainStore(appMainStoreKeys.IsErrored);
  const [isLoading, setIsLoading] = useAppMainStore(appMainStoreKeys.IsLoading);

  async function initialize() {
    setIsErrored(false);
    setIsLoading(true);
    try {
      await fetchAppSettings();
      await fetchCurrentUser();
      await fetchUserSettings();
    } catch (error) {
      console.error(error);
      setIsErrored(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    initialize();
    document.title = appMainStoreInitialState.appName;
  }, []);

  if (isErrored) return <ErrorScreen />;
  if (isLoading) return <LoadScreen />;

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

function ErrorScreen() {
  return (
    <div className="w-screen h-screen flex justify-center items-center overflow-auto dark:bg-gray-900">
      <div className="text-3xl text-white bg-red-700 py-4 px-8 rounded w-fit flex gap-3">
        <ExclamationTriangleIcon className="w-9 h-9" />
        There was an error while loading application.
      </div>
    </div>
  );
}

function LoadScreen() {
  return (
    <div className="w-screen h-screen gradient-animate overflow-auto"></div>
  );
}
export default App;
