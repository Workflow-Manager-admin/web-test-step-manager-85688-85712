import React from "react";
import "./Sidebar.css";

// PUBLIC_INTERFACE
export default function Sidebar({ suites, currentSuiteId, onSelectSuite, onAddSuite }) {
  /** Sidebar: navigation for all test suites, add suite button */
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Suites</div>
      <ul className="sidebar-list">
        {suites.map((suite) => (
          <li
            key={suite.id}
            className={suite.id === currentSuiteId ? "selected" : ""}
            onClick={() => onSelectSuite(suite)}
            tabIndex={0}
            data-testid={`suite-${suite.id}`}
          >
            {suite.name}
          </li>
        ))}
      </ul>
      <button className="btn-accent btn-add-suite" onClick={onAddSuite}>
        + Add Suite
      </button>
    </aside>
  );
}
