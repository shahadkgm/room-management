import React, { useState, useEffect } from "react";
import type { RoomWithBookings, Booking } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
  const { role } = useAuth();
  const isVisitor = role === "visitor";
  const [roomData, setRoomData] = useState<RoomWithBookings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dischargeDates, setDischargeDates] = useState<{ [bookingId: string]: string }>({});
  const [isDischarging, setIsDischarging] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit-reservation state
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ admissionDate: string; expectedDischargeDate: string }>({
    admissionDate: "",
    expectedDischargeDate: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Custom confirm state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    bookingId: string;
    patientName: string;
    action: "discharge" | "cancel";
  }>({ open: false, bookingId: "", patientName: "", action: "discharge" });

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
    setConfirmState({ open: true, bookingId, patientName: patientName || "this patient", action: "discharge" });
  };

  const handleConfirmAction = async () => {
    const { bookingId, action } = confirmState;
    setConfirmState({ open: false, bookingId: "", patientName: "", action: "discharge" });

    if (action === "discharge") {
      try {
        setIsDischarging(bookingId);
        setErrorMsg(null);
        const date = dischargeDates[bookingId] || new Date().toISOString().split("T")[0];
        await api.dischargePatient(bookingId, date);
        setSuccessMsg("Patient discharged successfully. Room freed!");
        onRefresh();
        await fetchDetails();
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to discharge patient.");
      } finally {
        setIsDischarging(null);
      }
    } else if (action === "cancel") {
      try {
        setErrorMsg(null);
        await api.cancelBooking(bookingId);
        setSuccessMsg("Reservation cancelled successfully.");
        onRefresh();
        await fetchDetails();
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to cancel reservation.");
      }
    }
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setEditForm({
      admissionDate: booking.admissionDate.split("T")[0],
      expectedDischargeDate: booking.expectedDischargeDate.split("T")[0],
    });
    setErrorMsg(null);
  };

  const handleEditSave = async () => {
    if (!editingBookingId) return;
    try {
      setIsSavingEdit(true);
      setErrorMsg(null);
      await api.updateBooking(editingBookingId, editForm);
      setSuccessMsg("Reservation dates updated successfully.");
      setEditingBookingId(null);
      onRefresh();
      await fetchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update reservation.");
    } finally {
      setIsSavingEdit(false);
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
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: "40px", textAlign: "center", width: "90%", maxWidth: "540px" }}>
          <p style={{ color: "#64748b" }}>Loading room details...</p>
        </div>
      </div>
    );
  }

  const allActiveUpcoming = [...(roomData.activeBookings || []), ...(roomData.upcomingBookings || [])];

  const confirmTitle = confirmState.action === "discharge" ? "Discharge Patient" : "Cancel Reservation";
  const confirmMessage =
    confirmState.action === "discharge"
      ? `Are you sure you want to discharge ${confirmState.patientName} from Room ${roomData.roomNumber}? This action cannot be undone.`
      : `Are you sure you want to cancel the reservation for ${confirmState.patientName}? The booking will be removed.`;
  const confirmLabel = confirmState.action === "discharge" ? "Yes, Discharge" : "Yes, Cancel";
  const keepLabel = confirmState.action === "discharge" ? "Keep Admitted" : "Keep Reservation";

  return (
    <>
      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        cancelLabel={keepLabel}
        variant="danger"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ open: false, bookingId: "", patientName: "", action: "discharge" })}
      />

      <div className="modal-overlay" onClick={onClose}>
        {/* Scoped Responsive CSS */}
        <style>{`
          .responsive-modal-dialog {
            width: 92% !important;
            max-width: 540px !important;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 16px;
            box-sizing: border-box;
          }
          .responsive-booking-header {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 12px;
          }
          .responsive-action-group {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .responsive-form-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
          }
          @media (min-width: 500px) {
            .responsive-booking-header {
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
            }
            .responsive-form-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
        `}</style>

        <div className="modal-dialog responsive-modal-dialog" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <div className="modal-title-wrap" style={{ flexWrap: "wrap", gap: "8px" }}>
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
          <div className="modal-body" style={{ padding: "16px" }}>
            {errorMsg && <div className="alert-error">{errorMsg}</div>}
            {successMsg && <div className="alert-success">{successMsg}</div>}

            <div className="modal-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Active &amp; Upcoming ({allActiveUpcoming.length})
              </h4>
              {!isVisitor && (
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
              )}
            </div>

            {allActiveUpcoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <p style={{ marginBottom: isVisitor ? "0" : "14px" }}>No active or reserved bookings for this room.</p>
                {!isVisitor && (
                  <button className="btn-primary" style={{ margin: "0 auto", display: "inline-flex" }} onClick={() => onOpenAddBooking(roomData.id)}>
                    + Admit or Reserve Patient
                  </button>
                )}
              </div>
            ) : (
              allActiveUpcoming.map((booking: Booking) => {
                const isActive = booking.status === "active";
                const isReserved = booking.status === "reserved";
                const daysLeft = calculateDaysRemaining(booking.expectedDischargeDate);
                const isEditing = editingBookingId === booking.id;

                return (
                  <div key={booking.id} className="booking-card-white" style={{ overflow: "hidden" }}>
                    {/* Patient Line */}
                    <div className="responsive-booking-header">
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
                      <div className="responsive-action-group">
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

                        {/* Edit & Cancel buttons for RESERVED bookings */}
                        {isReserved && !isEditing && !isVisitor && (
                          <>
                            <button
                              id={`edit-reservation-${booking.id}`}
                              title="Edit reservation dates"
                              onClick={() => handleEditClick(booking)}
                              style={{
                                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "7px",
                                padding: "4px 10px",
                                fontSize: "11.5px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              id={`cancel-reservation-${booking.id}`}
                              title="Cancel reservation"
                              onClick={() =>
                                setConfirmState({
                                  open: true,
                                  bookingId: booking.id,
                                  patientName: booking.patient?.name || "this patient",
                                  action: "cancel",
                                })
                              }
                              style={{
                                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "7px",
                                padding: "4px 10px",
                                fontSize: "11.5px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              🗑️ Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Edit Form for Reserved Booking */}
                    {isReserved && isEditing && (
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1.5px solid #86efac",
                          borderRadius: "10px",
                          padding: "14px",
                          marginTop: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "#065f46" }}>✏️ Edit Reservation Dates</div>
                        <div className="responsive-form-grid">
                          <div className="form-field">
                            <label style={{ fontSize: "12px" }}>Admission Date</label>
                            <input
                              type="date"
                              style={{ width: "100%", boxSizing: "border-box" }}
                              value={editForm.admissionDate}
                              onChange={(e) => setEditForm({ ...editForm, admissionDate: e.target.value })}
                            />
                          </div>
                          <div className="form-field">
                            <label style={{ fontSize: "12px" }}>Expected Discharge</label>
                            <input
                              type="date"
                              style={{ width: "100%", boxSizing: "border-box" }}
                              value={editForm.expectedDischargeDate}
                              onChange={(e) => setEditForm({ ...editForm, expectedDischargeDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setEditingBookingId(null)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "7px",
                              border: "1.5px solid #cbd5e1",
                              background: "#fff",
                              color: "#475569",
                              fontWeight: 600,
                              cursor: "pointer",
                              fontSize: "12.5px",
                            }}
                          >
                            Discard
                          </button>
                          <button
                            onClick={handleEditSave}
                            disabled={isSavingEdit}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "7px",
                              border: "none",
                              background: "linear-gradient(135deg, #0d9488, #0f766e)",
                              color: "#fff",
                              fontWeight: 600,
                              cursor: isSavingEdit ? "not-allowed" : "pointer",
                              fontSize: "12.5px",
                            }}
                          >
                            {isSavingEdit ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dates Grid */}
                    {!isEditing && (
                      <div className="dates-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                        <div className="date-block">
                          <div className="label">Admission</div>
                          <div className="val">{formatDateDisplay(booking.admissionDate)}</div>
                        </div>
                        <div className="date-block">
                          <div className="label">Expected Discharge</div>
                          <div className="val">{formatDateDisplay(booking.expectedDischargeDate)}</div>
                        </div>
                      </div>
                    )}

                    {booking.patient?.address && !isEditing && (
                      <div style={{ display: "flex", gap: "8px", fontSize: "12.5px", flexWrap: "wrap", marginTop: "8px" }}>
                        <span style={{ color: "#94a3b8", fontWeight: 600 }}>Address:</span>
                        <span style={{ color: "#475569" }}>{booking.patient.address}</span>
                      </div>
                    )}

                    {isActive && (
                      <div className="discharge-countdown-alert" style={{ marginTop: "10px" }}>
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

                    {isActive && !isVisitor && (
                      <div className="discharge-action-box" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                        <div className="form-field" style={{ width: "100%" }}>
                          <label>Actual discharge date</label>
                          <input
                            type="date"
                            style={{ width: "100%", boxSizing: "border-box" }}
                            value={dischargeDates[booking.id] || ""}
                            onChange={(e) => setDischargeDates({ ...dischargeDates, [booking.id]: e.target.value })}
                          />
                        </div>
                        <button
                          className="btn-discharge"
                          style={{ width: "100%" }}
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