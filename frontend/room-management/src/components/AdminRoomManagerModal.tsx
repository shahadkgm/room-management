import React, { useState } from "react";
import type { Room } from "../types";
import { api } from "../services/api";
import { ConfirmModal } from "./ConfirmModal";

interface AdminRoomManagerModalProps {
  rooms: Room[];
  onRefresh: () => void;
}

export const AdminRoomManagerModal: React.FC<AdminRoomManagerModalProps> = ({ rooms, onRefresh }) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [ward, setWard] = useState("Ibn Sina Ward");
  const [floor, setFloor] = useState(1);
  const [bedCount, setBedCount] = useState(2);
  const [amenities, setAmenities] = useState("AC, Attached Bath, Oxygen Line");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Custom confirm modal state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: "delete" | "maintenance" | null;
    room: Room | null;
  }>({ open: false, type: null, room: null });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setSubmitting(true);
      await api.createRoom({
        roomNumber,
        ward,
        floor: Number(floor),
        bedCount: Number(bedCount),
        amenities: amenities.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setSuccessMsg(`Room ${roomNumber} created successfully!`);
      setRoomNumber("");
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create room.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    const { type, room } = confirmState;
    setConfirmState({ open: false, type: null, room: null });
    if (!room) return;

    if (type === "maintenance") {
      try {
        await api.setRoomMaintenance(room.id, !room.isUnderMaintenance);
        onRefresh();
      } catch (err: any) {
        setErrorMsg(err.message || "Could not toggle maintenance.");
      }
    } else if (type === "delete") {
      try {
        await api.deleteRoom(room.id);
        onRefresh();
      } catch (err: any) {
        setErrorMsg(err.message || "Could not delete room.");
      }
    }
  };

  const getConfirmProps = () => {
    const { type, room } = confirmState;
    if (!room) return { title: "", message: "", confirmLabel: "", variant: "danger" as const };
    if (type === "delete") return {
      title: "Delete Room",
      message: `Are you sure you want to permanently delete Room ${room.roomNumber}? This cannot be undone.`,
      confirmLabel: "Yes, Delete",
      variant: "danger" as const,
    };
    const goingToMaintenance = !room.isUnderMaintenance;
    return {
      title: goingToMaintenance ? "Mark as Maintenance" : "Mark as Operational",
      message: goingToMaintenance
        ? `Room ${room.roomNumber} will be taken out of service and marked as Under Maintenance.`
        : `Room ${room.roomNumber} will be restored to active operation.`,
      confirmLabel: goingToMaintenance ? "Mark as Maintenance" : "Mark Operational",
      variant: goingToMaintenance ? "warning" as const : "info" as const,
    };
  };

  const confirmProps = getConfirmProps();

  return (
    <>
      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmProps.title}
        message={confirmProps.message}
        confirmLabel={confirmProps.confirmLabel}
        cancelLabel="Go Back"
        variant={confirmProps.variant}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ open: false, type: null, room: null })}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Add New Room Form */}
        <div className="timeline-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "20px" }}>🏛️</span>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Add New Hospital Room</h3>
          </div>

          {errorMsg && <div className="alert-error" style={{ marginBottom: "16px" }}>{errorMsg}</div>}
          {successMsg && <div className="alert-success" style={{ marginBottom: "16px" }}>{successMsg}</div>}

          <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
            <div className="form-field">
              <label>Room Number *</label>
              <input type="text" placeholder="e.g. 109, 301" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
            </div>

            <div className="form-field">
              <label>Ward Name *</label>
              <select value={ward} onChange={(e) => setWard(e.target.value)}>
                <option value="Ibn Sina Ward">Ibn Sina Ward</option>
                <option value="Deluxe Private Ward">Deluxe Private Ward</option>
                <option value="General Ward">General Ward</option>
                <option value="Specialized Care Unit">Specialized Care Unit</option>
              </select>
            </div>

            <div className="form-field">
              <label>Floor *</label>
              <input type="number" min="1" max="10" value={floor} onChange={(e) => setFloor(Number(e.target.value))} required />
            </div>

            <div className="form-field">
              <label>Bed Count *</label>
              <input type="number" min="1" max="20" value={bedCount} onChange={(e) => setBedCount(Number(e.target.value))} required />
            </div>

            <div className="form-field">
              <label>Amenities (Comma separated)</label>
              <input type="text" placeholder="AC, Oxygen Line, Attached Bath" value={amenities} onChange={(e) => setAmenities(e.target.value)} />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting} style={{ height: "38px", justifyContent: "center" }}>
              {submitting ? "Adding..." : "+ Create Room"}
            </button>
          </form>
        </div>

        {/* Room Table */}
        <div className="timeline-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "20px" }}>⚙️</span>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Manage Hospital Rooms & Maintenance Status</h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="timeline-table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Ward Name</th>
                  <th>Floor</th>
                  <th>Beds</th>
                  <th>Status</th>
                  <th>Maintenance Control</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>Room {r.roomNumber}</td>
                    <td style={{ color: "#334155", fontWeight: 500 }}>{r.ward}</td>
                    <td style={{ color: "#64748b" }}>Floor {r.floor}</td>
                    <td style={{ color: "#64748b" }}>{r.bedCount} beds</td>
                    <td>
                      <span className={`badge badge-${r.status}`}>{r.status.toUpperCase()}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setConfirmState({ open: true, type: "maintenance", room: r })}
                        style={{
                          padding: "5px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "7px",
                          border: `1px solid ${r.isUnderMaintenance ? "#fecaca" : "#a7f3d0"}`,
                          background: r.isUnderMaintenance ? "#fef2f2" : "#ecfdf5",
                          color: r.isUnderMaintenance ? "#dc2626" : "#059669",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {r.isUnderMaintenance ? "🛠️ Maintenance" : "✅ Operational"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setConfirmState({ open: true, type: "delete", room: r })}
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "5px 12px",
                          borderRadius: "7px",
                          transition: "all 0.15s",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
