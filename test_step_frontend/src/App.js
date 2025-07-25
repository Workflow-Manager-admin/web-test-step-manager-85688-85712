import React, { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import {
  fetchSuites,
} from "./api";

// Custom theme colors for CSS variables
const COLOR_VARS = {
  "--primary": "#1976D2",
  "--secondary": "#424242",
  "--accent": "#FFC107",
};

function applyThemeVars(theme) {
  // Only light mode for now, but future proof for dark
  for (const k in COLOR_VARS) document.documentElement.style.setProperty(k, COLOR_VARS[k]);
  document.documentElement.setAttribute("data-theme", "light");
}

// PUBLIC_INTERFACE
function App() {
  // Sidebar state
  const [suites, setSuites] = useState([]);
  const [currentSuite, setCurrentSuite] = useState(null);

  useEffect(() => {
    applyThemeVars("light");
  }, []);

  // Load suites for sidebar/global selection
  useEffect(() => {
    fetchSuites().then(list => {
      setSuites(Array.isArray(list) ? list : []);
      if (!currentSuite && list.length) setCurrentSuite(list[0]);
    });
  }, []);

  // When created/deleted, refresh sidebar
  // (lifting state up so that Sidebar and Dashboard share suite info)
  const handleSelectSuite = (suite) => setCurrentSuite(suite);
  const handleAddSuite = async () => {
    // open new suite modal from Dashboard via event
    const reload = window.dispatchEvent(new CustomEvent("openAddSuiteModal"));
    // handled in Dashboard
  };

  // Listen to suite list and current suite changes from Dashboard
  useEffect(() => {
    const reloadSuites = async () => {
      const list = await fetchSuites();
      setSuites(Array.isArray(list) ? list : []);
    };
    const toReload = () => reloadSuites();
    window.addEventListener("suiteListChanged", toReload);
    return () => window.removeEventListener("suiteListChanged", toReload);
  }, []);

  useEffect(() => {
    const currHandler = (e) => setCurrentSuite(e.detail);
    window.addEventListener("currentSuiteChanged", currHandler);
    return () => window.removeEventListener("currentSuiteChanged", currHandler);
  }, []);

  const handleUserMenu = () => {
    alert("User menu (stub). Add account or logout actions here.");
  };

  return (
    <div style={{
      background: "var(--bg-primary, #fff)",
      color: "var(--text-primary, #282c34)",
      minHeight: "100vh",
      minWidth: "0",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header onUserMenu={handleUserMenu} />
      <div style={{ display: "flex", flex: "1 1 auto", minHeight: 0 }}>
        <Sidebar
          suites={suites}
          currentSuiteId={currentSuite && currentSuite.id}
          onSelectSuite={handleSelectSuite}
          onAddSuite={handleAddSuite}
        />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
