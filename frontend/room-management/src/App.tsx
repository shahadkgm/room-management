import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import type { NavTab } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { RoomBoardView } from "./components/RoomBoardView";
import { DashboardView } from "./components/DashboardView";
import { RoomCalendarView } from "./components/RoomCalendarView";
import { PatientDirectoryView } from "./components/PatientDirectoryView";
import { AdminRoomManagerModal } from "./components/AdminRoomManagerModal";
import { RoomDetailsModal } from "./components/RoomDetailsModal";
import { PatientAdmissionModal } from "./components/PatientAdmissionModal";
import { UserManagementView } from "./components/UserManagementView";
import { LoginPage } from "./components/LoginPage";
import type { Room, DashboardStats } from "./types";
import { api } from "./services/api";
import "./App.css";

const MainAppContent: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("board");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [admissionPreselectedRoom, setAdmissionPreselectedRoom] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [fetchedRooms, fetchedStats] = await Promise.all([
        api.getRooms(),
        api.getDashboardStats(),
      ]);
      setRooms(fetchedRooms);
      setStats(fetchedStats);
    } catch (error) {
      console.error("Error loading application state:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
      const interval = setInterval(loadData, 10000); // 10s live sync
      return () => clearInterval(interval);
    }
  }, [user, loadData]);

  const isVisitor = user?.role === "visitor";

  useEffect(() => {
    if (isVisitor && activeTab !== "dashboard" && activeTab !== "calendar") {
      setActiveTab("dashboard");
    }
  }, [isVisitor, activeTab]);

  const handleOpenAdmissionWithRoom = (roomId: string) => {
    if (isVisitor) return;
    setAdmissionPreselectedRoom(roomId);
    setIsAdmissionOpen(true);
  };

  const handleOpenGeneralAdmission = () => {
    if (isVisitor) return;
    setAdmissionPreselectedRoom(undefined);
    setIsAdmissionOpen(true);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "board":
        return "Room board";
      case "dashboard":
        return "Executive Hospital Dashboard";
      case "calendar":
        return "Room Calendar & Timeline";
      case "patients":
        return "Patient Management & Directory";
      case "admin-rooms":
        return "Hospital Room & Ward Controls";
      case "user-management":
        return "User Management & Approvals";
      default:
        return "Room Management";
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#060913", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading Unani Hospital Workspace...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Left Sidebar / Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmission={handleOpenGeneralAdmission}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          title={getTabTitle()}
          stats={stats}
          onOpenAdmission={handleOpenGeneralAdmission}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="page-content">
          {loading ? (
            <div style={{ color: "var(--text-muted)", padding: "40px 0", textAlign: "center" }}>
              Connecting to Unani Hospital Room Management Server...
            </div>
          ) : (
            <>
              {activeTab === "board" && (
                <RoomBoardView
                  rooms={rooms}
                  onSelectRoom={(id) => setSelectedRoomId(id)}
                  onAdmitForRoom={handleOpenAdmissionWithRoom}
                />
              )}

              {activeTab === "dashboard" && (
                <DashboardView
                  stats={stats}
                  rooms={rooms}
                  onOpenAdmission={handleOpenGeneralAdmission}
                  onSelectRoom={(id) => setSelectedRoomId(id)}
                />
              )}

              {activeTab === "calendar" && (
                <RoomCalendarView
                  onSelectRoom={(id) => setSelectedRoomId(id)}
                />
              )}

              {activeTab === "patients" && (
                <PatientDirectoryView onOpenAdmission={handleOpenGeneralAdmission} />
              )}

              {activeTab === "admin-rooms" && (
                <AdminRoomManagerModal rooms={rooms} onRefresh={loadData} />
              )}

              {activeTab === "user-management" && (
                <UserManagementView />
              )}
            </>
          )}
        </main>
      </div>

      {/* Room Details Modal */}
      {selectedRoomId && (
        <RoomDetailsModal
          roomId={selectedRoomId}
          onClose={() => setSelectedRoomId(null)}
          onRefresh={loadData}
          onOpenAddBooking={(roomId) => {
            setSelectedRoomId(null);
            handleOpenAdmissionWithRoom(roomId);
          }}
        />
      )}

      {/* Patient Admission Modal */}
      {isAdmissionOpen && (
        <PatientAdmissionModal
          rooms={rooms}
          preselectedRoomId={admissionPreselectedRoom}
          onClose={() => setIsAdmissionOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
