import React from "react";
import { useAuth } from "../context/AuthContext";

export type NavTab = "board" | "dashboard" | "calendar" | "patients" | "admin-rooms" | "user-management";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAdmission: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenAdmission }) => {
  const { user, role, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <div className="brand-icon">🌿</div>
          <div className="brand-info">
            <h2>Unani Hospital</h2>
            <p>Room Management</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </button>

          <button
            className={`nav-item ${activeTab === "board" ? "active" : ""}`}
            onClick={() => setActiveTab("board")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Rooms Board
          </button>

          <button
            className={`nav-item ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Room Calendar
          </button>

          <button
            className={`nav-item ${activeTab === "patients" ? "active" : ""}`}
            onClick={() => setActiveTab("patients")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Patients
          </button>

          <button
            className={`nav-item ${activeTab === "admin-rooms" ? "active" : ""}`}
            onClick={() => setActiveTab("admin-rooms")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Room Management
          </button>

          {role === "admin" && (
            <button
              className={`nav-item ${activeTab === "user-management" ? "active" : ""}`}
              onClick={() => setActiveTab("user-management")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              User Management
            </button>
          )}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }} onClick={onOpenAdmission}>
          <span>+ Admit Patient</span>
        </button>

        <button
          className="btn-outline"
          style={{ width: "100%", justifyContent: "center", borderColor: "rgba(16, 185, 129, 0.4)", color: "#10b981" }}
          onClick={() => setActiveTab("admin-rooms")}
        >
          <span>+ Add / Manage Rooms</span>
        </button>

        <div className="user-profile">
          <div className="user-avatar">{user?.name ? user.name.charAt(0) : "U"}</div>
          <div className="user-meta">
            <span className="label">Signed In As</span>
            <div className="name">{user?.name || "Shahad"}</div>
            <span className="role-pill">{role}</span>
          </div>
        </div>

        <button
          className="role-switcher-btn"
          style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}
          onClick={logout}
          title="Sign out of your account"
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};
