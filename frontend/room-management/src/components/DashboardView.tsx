import React from "react";
import type { DashboardStats, Booking, Room } from "../types";
import { useAuth } from "../context/AuthContext";

interface DashboardViewProps {
  stats: DashboardStats | null;
  rooms?: Room[];
  onOpenAdmission?: () => void;
  onSelectRoom: (roomId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  rooms = [],
  onOpenAdmission,
  onSelectRoom,
}) => {
  const { role } = useAuth();
  const isVisitor = role === "visitor";

  if (!stats) {
    return <div style={{ padding: "40px", color: "#64748b", textAlign: "center" }}>Loading dashboard statistics...</div>;
  }

  const occupancyRate =
    stats.totalRooms > 0
      ? Math.round(((stats.occupiedRooms + stats.reservedRooms) / stats.totalRooms) * 100)
      : 0;

  const todayFormatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const availableRoomsList = rooms.filter((r) => r.status === "available");

  // Calculate Ward Occupancy Breakdown
  const wardBreakdown = React.useMemo(() => {
    const map: { [ward: string]: { total: number; occupied: number } } = {};
    rooms.forEach((r) => {
      const wardName = r.ward;
      if (!map[wardName]) {
        map[wardName] = { total: 0, occupied: 0 };
      }
      map[wardName].total += 1;
      if (r.status === "occupied" || r.status === "reserved") {
        map[wardName].occupied += 1;
      }
    });
    return Object.entries(map).map(([ward, data]) => ({
      ward,
      total: data.total,
      occupied: data.occupied,
      percentage: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
    }));
  }, [rooms]);

  return (
    <div className="dashboard-view">
      {/* Top Banner Row */}
      <div className="dashboard-top-banner">
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Hospital overview</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            {occupancyRate}% occupancy · {stats.totalRooms} rooms across wards
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {onOpenAdmission && !isVisitor && (
            <button className="btn-primary" onClick={onOpenAdmission}>
              <span>Admit patient →</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="dashboard-kpi-grid">
        <div className="stat-card">
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" }}>TOTAL CAPACITY</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>{stats.totalRooms}</div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Hospital Rooms</div>
        </div>

        <div className="stat-card" style={{ borderColor: "#a7f3d0" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", letterSpacing: "0.05em" }}>AVAILABLE ROOMS</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", margin: "4px 0" }}>{stats.availableRooms}</div>
          <div style={{ fontSize: "12px", color: "#047857" }}>Ready for admission</div>
        </div>

        <div className="stat-card" style={{ borderColor: "#bfdbfe" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.05em" }}>OCCUPIED ROOMS</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb", margin: "4px 0" }}>{stats.occupiedRooms}</div>
          <div style={{ fontSize: "12px", color: "#1d4ed8" }}>In stay</div>
        </div>

        <div className="stat-card" style={{ borderColor: "#fde68a" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#d97706", letterSpacing: "0.05em" }}>RESERVED ROOMS</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#d97706", margin: "4px 0" }}>{stats.reservedRooms}</div>
          <div style={{ fontSize: "12px", color: "#b45309" }}>Upcoming bookings</div>
        </div>

        <div className="stat-card" style={{ borderColor: "#fecaca" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626", letterSpacing: "0.05em" }}>MAINTENANCE</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#dc2626", margin: "4px 0" }}>{stats.maintenanceRooms}</div>
          <div style={{ fontSize: "12px", color: "#b91c1c" }}>Out of service</div>
        </div>
      </div>

      {/* Grid Row: Today Activity & Ward Breakdown */}
      <div className="dashboard-main-grid">
        {/* Today Activity Card */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
            Today · {todayFormatted}
          </h3>

          <div className="dashboard-today-subgrid">
            {/* Admissions Today Box */}
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ADMISSIONS TODAY
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#047857", margin: "6px 0 2px 0" }}>
                {stats.expectedAdmissionsToday}
              </div>
              <div style={{ fontSize: "12px", color: "#047857" }}>
                {stats.expectedAdmissionsToday > 0 ? `${stats.expectedAdmissionsToday} scheduled` : "No admissions recorded yet."}
              </div>
            </div>

            {/* Expected Discharges Today Box */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                EXPECTED DISCHARGES TODAY
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#b45309", margin: "6px 0 2px 0" }}>
                {stats.expectedDischargesToday}
              </div>
              <div style={{ fontSize: "12px", color: "#b45309" }}>
                {stats.expectedDischargesToday > 0 ? `${stats.expectedDischargesToday} pending` : "Nothing scheduled for today."}
              </div>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              <span>Occupancy</span>
              <span>{stats.occupiedRooms + stats.reservedRooms}/{stats.totalRooms} rooms</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${occupancyRate}%`,
                  height: "100%",
                  background: "#0d9488",
                  borderRadius: "999px",
                  transition: "width 0.4s ease",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Ward Occupancy Progress Chart */}
        <div className="dashboard-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>📊 Ward Occupancy Rate</h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Bed utilization across hospital wards</p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#0d9488", background: "#f0fdf4", padding: "3px 8px", borderRadius: "20px" }}>
              Live
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {wardBreakdown.map((item) => (
              <div key={item.ward}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  <span>{item.ward}</span>
                  <span>{item.occupied}/{item.total} rooms ({item.percentage}%)</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: "100%",
                      background: item.percentage > 70 ? "#ea580c" : item.percentage > 40 ? "#0d9488" : "#10b981",
                      borderRadius: "999px",
                      transition: "width 0.5s ease",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discharge Alerts & Available Rooms */}
      <div className="dashboard-bottom-grid">
        {/* Discharge Alerts Card */}
        <div className="dashboard-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 700, color: "#b45309", marginBottom: "16px" }}>
            <span>⚠️</span>
            <span>Discharge alerts</span>
          </div>

          {stats.overdueDischargesList && stats.overdueDischargesList.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stats.overdueDischargesList.slice(0, 3).map((b: Booking) => (
                <div
                  key={b.id}
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    cursor: "pointer",
                  }}
                  onClick={() => onSelectRoom(b.roomId)}
                >
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#78350f" }}>{b.patient?.name || "Patient"}</div>
                  <div style={{ fontSize: "12px", color: "#92400e", marginTop: "2px" }}>
                    Room {b.room?.roomNumber} · due for discharge
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No urgent discharge alerts.
            </div>
          )}
        </div>

        {/* Rooms Ready for Admission Box */}
        <div className="dashboard-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Rooms ready for admission</h3>
            {!isVisitor && <span style={{ fontSize: "13px", color: "#0d9488", fontWeight: 600, cursor: "pointer" }}>Open room board →</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
            {availableRoomsList.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#047857",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onClick={() => onSelectRoom(r.id)}
              >
                <span>{r.roomNumber}</span>
                <span style={{ fontWeight: 400, color: "#059669", fontSize: "12px" }}>{r.ward.replace("Ward", "").trim()}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#059669", fontWeight: 600 }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};
