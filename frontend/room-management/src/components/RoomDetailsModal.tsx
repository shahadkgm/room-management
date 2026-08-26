import React, { useState, useEffect } from "react";
import type { RoomWithBookings, Booking } from "../types";
import { api } from "../services/api";
import { ConfirmModal } from "./ConfirmModal";

interface RoomDetailsModalProps {
  roomId: string;
  onClose: () => void;
  onRefresh: () => void;
  onOpenAddBooking: (roomId: string) => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  roomId,
  onClose,
  onRefresh,
  onOpenAddBooking,
}) => {
  const [roomData, setRoomData] = useState<RoomWithBookings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dischargeDates, setDischargeDates] = useState<{ [bookingId: string]: string }>({});
  const [dischargeNotes] = useState<{ [bookingId: string]: string }>({});
  const [isDischarging, setIsDischarging] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Custom confirm state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    bookingId: string;
    patientName: string;
  }>({ open: false, bookingId: "", patientName: "" });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getRoomById(roomId);
      setRoomData(data);

      const defaultDate = new Date().toISOString().split("T")[0];
      const initialDates: { [key: string]: string } = {};
      if (data.activeBookings) {
        data.activeBookings.forEach((b) => {
          initialDates[b.id] = defaultDate;
        });
      }
      setDischargeDates(initialDates);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load room details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [roomId]);

  const handleDischargeClick = (bookingId: string, patientName?: string) => {
    setConfirmState({ open: true, bookingId, patientName: patientName || "this patient" });
  };

  const handleDischargeConfirmed = async () => {
    const { bookingId } = confirmState;
    setConfirmState({ open: false, bookingId: "", patientName: "" });
    try {
      setIsDischarging(bookingId);
      setErrorMsg(null);
      const date = dischargeDates[bookingId] || new Date().toISOString().split("T")[0];
      const notes = dischargeNotes[bookingId];
      await api.dischargePatient(bookingId, date, notes);
      setSuccessMsg("Patient discharged successfully. Room freed!");
      onRefresh();
      await fetchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to discharge patient.");
    } finally {
      setIsDischarging(null);
    }
  };

  const calculateDaysRemaining = (expectedDischarge: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expectedDischarge);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  if (loading || !roomData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#64748b" }}>Loading room details...</p>
        </div>
      </div>
    );
  }

  const allActiveUpcoming = [...(roomData.activeBookings || []), ...(roomData.upcomingBookings || [])];

  return (
    <>
      <ConfirmModal
        isOpen={confirmState.open}
        title="Discharge Patient"
        message={`Are you sure you want to discharge ${confirmState.patientName} from Room ${roomData.roomNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Discharge"
        cancelLabel="Keep Admitted"
        variant="danger"
        onConfirm={handleDischargeConfirmed}
        onCancel={() => setConfirmState({ open: false, bookingId: "", patientName: "" })}
      />

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <div className="modal-title-wrap">
                <h2>Room {roomData.roomNumber}</h2>
                <span className={`badge badge-${roomData.status}`}>
                  • {roomData.status.charAt(0).toUpperCase() + roomData.status.slice(1)}
                </span>
              </div>
              <p className="modal-sub">
                {roomData.ward} · Floor {roomData.floor} · {roomData.bedCount} bed(s)
              </p>
            </div>
            <button className="close-btn" onClick={onClose} title="Close">✕</button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {errorMsg && <div className="alert-error">{errorMsg}</div>}
            {successMsg && <div className="alert-success">{successMsg}</div>}

            <div className="modal-section-title">
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                Active & Upcoming ({allActiveUpcoming.length})
              </h4>
              <button
                style={{
                  background: "linear-gradient(135deg, #0d9488, #0f766e)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                onClick={() => onOpenAddBooking(roomData.id)}
              >
                📅 + Add Booking
              </button>
            </div>

            {allActiveUpcoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <p style={{ marginBottom: "14px" }}>No active or reserved bookings for this room.</p>
                <button className="btn-primary" style={{ margin: "0 auto", display: "inline-flex" }} onClick={() => onOpenAddBooking(roomData.id)}>
                  + Admit or Reserve Patient
                </button>
              </div>
            ) : (
              allActiveUpcoming.map((booking: Booking) => {
                const isActive = booking.status === "active";
                const daysLeft = calculateDaysRemaining(booking.expectedDischargeDate);

                return (
                  <div key={booking.id} className="booking-card-white">
                    {/* Patient Line */}
                    <div className="booking-header">
                      <div className="patient-identity">
                        <div className="patient-identity-icon">👤</div>
                        <div>
                          <div className="patient-name-line">{booking.patient?.name || "Patient Record"}</div>
                          <div className="patient-meta-line">
                            {booking.patient?.age ? `${booking.patient.age} yrs · ` : ""}
                            {booking.patient?.gender ? `${booking.patient.gender} · ` : ""}
                            {booking.patient?.ailment || "General checkup"}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          background: isActive ? "#ecfdf5" : "#fffbeb",
                          color: isActive ? "#059669" : "#d97706",
                          border: `1px solid ${isActive ? "#a7f3d0" : "#fde68a"}`,
                        }}
                      >
                        {isActive ? "Active" : "Reserved"}
                      </span>
                    </div>

                    {/* Dates Grid */}
                    <div className="dates-grid">
                      <div className="date-block">
                        <div className="label">Admission</div>
                        <div className="val">{formatDateDisplay(booking.admissionDate)}</div>
                      </div>
                      <div className="date-block">
                        <div className="label">Expected Discharge</div>
                        <div className="val">{formatDateDisplay(booking.expectedDischargeDate)}</div>
                      </div>
                    </div>

                    {booking.patient?.address && (
                      <div style={{ display: "flex", gap: "8px", fontSize: "12.5px" }}>
                        <span style={{ color: "#94a3b8", fontWeight: 600 }}>Address:</span>
                        <span style={{ color: "#475569" }}>{booking.patient.address}</span>
                      </div>
                    )}

                    {booking.notes && (
                      <div style={{ display: "flex", gap: "8px", fontSize: "12.5px" }}>
                        <span style={{ color: "#94a3b8", fontWeight: 600 }}>Notes:</span>
                        <span style={{ color: "#475569" }}>{booking.notes}</span>
                      </div>
                    )}

                    {isActive && (
                      <div className="discharge-countdown-alert">
                        <span>⏰</span>
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft} day(s) until expected discharge`
                            : daysLeft === 0
                            ? "Expected discharge is TODAY"
                            : `Overdue by ${Math.abs(daysLeft)} day(s)!`}
                        </span>
                      </div>
                    )}

                    {isActive && (
                      <div className="discharge-action-box">
                        <div className="form-field" style={{ flex: 1 }}>
                          <label>Actual discharge date</label>
                          <input
                            type="date"
                            value={dischargeDates[booking.id] || ""}
                            onChange={(e) => setDischargeDates({ ...dischargeDates, [booking.id]: e.target.value })}
                          />
                        </div>
                        <button
                          className="btn-discharge"
                          disabled={isDischarging === booking.id}
                          onClick={() => handleDischargeClick(booking.id, booking.patient?.name)}
                        >
                          {isDischarging === booking.id ? "Discharging..." : "Discharge patient"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
