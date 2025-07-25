import React from "react";
import "./Header.css";

// PUBLIC_INTERFACE
export default function Header({ onUserMenu }) {
  /** Page header with branding and user menu */
  return (
    <header className="app-header">
      <div className="branding">
        <span className="brand-logo">🧪</span>
        <span className="brand-title">Test Step Manager</span>
      </div>
      <nav className="user-area">
        <button className="user-menu-btn" onClick={onUserMenu}>
          <span className="user-avatar" aria-label="user menu">👤</span>
        </button>
      </nav>
    </header>
  );
}
