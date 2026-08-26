import React, { useState } from "react";
import type { Room } from "../types";

interface RoomBoardViewProps {
  rooms: Room[];
  onSelectRoom: (roomId: string) => void;
  onAdmitForRoom: (roomId: string) => void;
}

export const RoomBoardView: React.FC<RoomBoardViewProps> = ({
  rooms,
  onSelectRoom,
  onAdmitForRoom,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [wardFilter, setWardFilter] = useState<string>("all");

  // Extract unique wards
  const wards = Array.from(new Set(rooms.map((r) => r.ward)));

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ward.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesWard = wardFilter === "all" || r.ward === wardFilter;

    return matchesSearch && matchesStatus && matchesWard;
  });

  // Group filtered rooms by Ward
  const groupedWards: { [wardName: string]: Room[] } = {};
  filteredRooms.forEach((r) => {
    if (!groupedWards[r.ward]) {
      groupedWards[r.ward] = [];
    }
    groupedWards[r.ward].push(r);
  });

  const handleRoomClick = (room: Room) => {
    if (room.status === "available") {
      onAdmitForRoom(room.id);
    } else {
      onSelectRoom(room.id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Filter and Search Bar */}
      <div className="summary-legend-bar">
        <div className="filter-bar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search room, type or ward"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            className="filter-select"
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
          >
            <option value="all">All wards</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot occupied"></span>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot reserved"></span>
            <span>Reserved</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot maintenance"></span>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Render Ward Groups */}
      {Object.keys(groupedWards).length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          <p>No rooms match the selected filters.</p>
        </div>
      ) : (
        Object.entries(groupedWards).map(([wardName, wardRooms]) => {
          const firstRoom = wardRooms[0];
          const floor = firstRoom?.floor || 1;

          return (
            <div key={wardName} className="ward-section">
              <div className="ward-header">
                <div className="ward-title">
                  <h3>{wardName}</h3>
                  <span>
                    Floor {floor} · {wardRooms.length} rooms
                  </span>
                </div>
              </div>

              <div className="rooms-grid">
                {wardRooms.map((room) => {
                  return (
                    <div
                      key={room.id}
                      className={`room-card status-${room.status}`}
                      onClick={() => handleRoomClick(room)}
                      title={`Room ${room.roomNumber} (${room.status}) - Click to view or admit`}
                    >
                      <div className="room-card-top">
                        <span className="room-number">{room.roomNumber}</span>
                        <span className="bed-badge">🛏️ {room.bedCount}</span>
                      </div>

                      <div className="room-card-bottom">
                        <div className="room-type">{room.ward}</div>
                        <div className={`room-status-note status-note-${room.status}`}>
                          {room.status === "available" && "Tap to book"}
                          {room.status === "occupied" && "Occupied · In stay"}
                          {room.status === "reserved" && "Reserved upcoming"}
                          {room.status === "maintenance" && "Under repair"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
