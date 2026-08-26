import React, { useState, useEffect, useMemo } from "react";
import type { Room, Booking } from "../types";
import { api } from "../services/api";
import "./RoomCalendarView.css";

interface RoomCalendarViewProps {
  onSelectRoom: (roomId: string) => void;
}

export const RoomCalendarView: React.FC<RoomCalendarViewProps> = ({ onSelectRoom }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [loading, setLoading] = useState(true);

  // Generate 28 consecutive days starting from startDate
  const days = useMemo(() => {
    const list: Date[] = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      list.push(d);
    }
    return list;
  }, [startDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedRooms, fetchedBookings] = await Promise.all([
          api.getRooms(),
          api.getBookings(),
        ]);
        setRooms(fetchedRooms);
        setBookings(fetchedBookings);
      } catch (err) {
        console.error("Error loading calendar matrix data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrevDays = () => {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() - 7);
    setStartDate(newStart);
  };

  const handleNextDays = () => {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() + 7);
    setStartDate(newStart);
  };

  const handleResetToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setStartDate(d);
  };

  const formatDateShort = (d: Date) => {
    return d.getDate().toString().padStart(2, "0");
  };

  const getDayInitial = (d: Date) => {
    const daysArr = ["S", "M", "T", "W", "T", "F", "S"];
    return daysArr[d.getDay()];
  };

  const formatRangeDisplay = () => {
    if (days.length === 0) return "";
    const start = days[0];
    const end = days[days.length - 1];

    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);

    return `${fmt(start)} → ${fmt(end)}`;
  };

  // Helper to determine status of a room on a specific day
  const getCellStatus = (room: Room, date: Date) => {
    if (room.isUnderMaintenance) {
      return { status: "maintenance", booking: null };
    }

    const targetTime = date.getTime();

    for (const b of bookings) {
      if (b.roomId !== room.id || b.status === "cancelled" || b.status === "completed") continue;

      const adminStart = new Date(b.admissionDate).getTime();
      const dischargeDateStr = b.actualDischargeDate || b.expectedDischargeDate;
      const dischargeTime = new Date(dischargeDateStr).getTime();

      if (targetTime >= adminStart && targetTime < dischargeTime) {
        return {
          status: b.status === "active" ? "occupied" : "reserved",
          booking: b,
        };
      }
    }

    return { status: "available", booking: null };
  };

  return (
    <div className="calendar-matrix-wrapper">
      {/* Top Header Bar */}
      <div className="calendar-top-header">
        <div className="title-area">
          <h2>Room calendar</h2>
          <span className="date-range-badge">{formatRangeDisplay()}</span>
        </div>

        <div className="controls-area">
          <button className="calendar-nav-btn" onClick={handlePrevDays} title="Previous 7 Days">
            &lt;
          </button>
          <button className="calendar-today-btn" onClick={handleResetToday}>
            Today
          </button>
          <button className="calendar-nav-btn" onClick={handleNextDays} title="Next 7 Days">
            &gt;
          </button>
        </div>
      </div>

      {/* Legend & Explanatory Bar */}
      <div className="calendar-legend-bar">
        <div className="legend-items">
          <div className="legend-item">
            <span className="dot available-dot"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="dot occupied-dot"></span>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <span className="dot reserved-dot"></span>
            <span>Reserved</span>
          </div>
          <div className="legend-item">
            <span className="dot maintenance-dot"></span>
            <span>Maintenance</span>
          </div>
        </div>

        <p className="legend-description">
          Each row is one room. Coloured blocks are bookings – empty cells are free dates
        </p>
      </div>

      {/* Matrix Table Container */}
      <div className="matrix-table-container">
        {loading ? (
          <div className="loading-state">Loading room availability matrix...</div>
        ) : (
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="sticky-col room-head-col">Room</th>
                {days.map((d, index) => (
                  <th key={index} className="date-col-head">
                    <div className="date-num">{formatDateShort(d)}</div>
                    <div className="date-day">{getDayInitial(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td className="sticky-col room-info-cell" onClick={() => onSelectRoom(r.id)}>
                    <div className="room-num-text">{r.roomNumber}</div>
                    <div className="ward-subtext">{r.ward.replace("Ward", "").trim()}</div>
                  </td>

                  {days.map((d, dateIdx) => {
                    const { status, booking } = getCellStatus(r, d);
                    return (
                      <td key={dateIdx} className="matrix-cell">
                        <div
                          className={`grid-block block-${status}`}
                          onClick={() => onSelectRoom(r.id)}
                          title={
                            booking
                              ? `Room ${r.roomNumber} - ${booking.patient?.name || "Patient"} (${status.toUpperCase()})`
                              : `Room ${r.roomNumber} - Available on ${d.toDateString()}`
                          }
                        ></div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
