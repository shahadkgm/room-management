import React from "react";
import { useAuth } from "../context/AuthContext";
import type { DashboardStats } from "../types";

interface NavbarProps {
  title: string;
  stats?: DashboardStats | null;
  onOpenAdmission: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, stats, onOpenAdmission, onToggleMobileMenu }) => {
  const { role } = useAuth();
  const todayFormatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="top-navbar">
      <div className="nav-header-left">
        {onToggleMobileMenu && (
          <button className="hamburger-btn" onClick={onToggleMobileMenu} title="Open Navigation Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <div className="nav-title-area">
          <h1>{title}</h1>
          {stats && (
            <p>
              {stats.availableRooms} available · {stats.occupiedRooms} occupied · {stats.reservedRooms} reserved · {stats.maintenanceRooms} under maintenance
            </p>
          )}
        </div>
      </div>

      <div className="nav-actions">
        <div className="live-badge">
          <span className="status-dot online"></span>
          <span>{role.charAt(0).toUpperCase() + role.slice(1)} | {todayFormatted}</span>
        </div>

        {role !== "visitor" && (
          <button className="btn-primary" onClick={onOpenAdmission}>
            <span>+ New Admission</span>
          </button>
        )}
      </div>
    </header>
  );
};
