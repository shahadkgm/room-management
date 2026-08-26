import React from "react";
import { useAuth } from "../context/AuthContext";
import type { DashboardStats } from "../types";

interface NavbarProps {
  title: string;
  stats?: DashboardStats | null;
  onOpenAdmission: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, stats, onOpenAdmission }) => {
  const { role } = useAuth();
  const todayFormatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="top-navbar">
      <div className="nav-title-area">
        <h1>{title}</h1>
        {stats && (
          <p>
            {stats.availableRooms} available · {stats.occupiedRooms} occupied · {stats.reservedRooms} reserved · {stats.maintenanceRooms} under maintenance
          </p>
        )}
      </div>

      <div className="nav-actions">
        <div className="live-badge">
          <span className="status-dot online"></span>
          <span>{role.charAt(0).toUpperCase() + role.slice(1)} | {todayFormatted}</span>
        </div>

        <button className="btn-primary" onClick={onOpenAdmission}>
          <span>+ New Admission</span>
        </button>
      </div>
    </header>
  );
};
