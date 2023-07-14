import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import PrivateWrapper from "./components/PrivateWrapper";
import { appMainStoreKeys, appMainStoreInitialState, useAppMainStore } from "./stores/appMainStore";
import { fetchAppSettings } from "./stores/appSettingsStore";
import { fetchCurrentUser } from "./stores/userCurrentStore";
import { fetchUserSettings } from "./stores/userSettingsStore";

const RegisterPage = React.lazy(() => import("./pages/register"));
const LoginPage = React.lazy(() => import("./pages/login"));

function App() {
  const [ isErrored, setIsErrored ] = useAppMainStore(appMainStoreKeys.IsErrored);
  const [ isLoading, setIsLoading ] = useAppMainStore(appMainStoreKeys.IsLoading);

  async function initialize() {
    setIsErrored(false);
    setIsLoading(true);
    try {
      await fetchAppSettings();
      await fetchCurrentUser();
      await fetchUserSettings();
    }
    catch(error) {
      console.log(error);
      setIsErrored(true);
    }
    finally {
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
    <div className="w-screen h-screen overflow-auto">There was an error while loading application.</div>
  );
}

function LoadScreen() {
  return (
    <div className="w-screen h-screen gradient-animate overflow-auto"></div>
  );
}
export default App;
