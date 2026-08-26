import React, { useState } from "react";
import type { Room } from "../types";
import { api } from "../services/api";

interface PatientAdmissionModalProps {
  rooms: Room[];
  preselectedRoomId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PatientAdmissionModal: React.FC<PatientAdmissionModalProps> = ({
  rooms,
  preselectedRoomId,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [roomId, setRoomId] = useState<string>(preselectedRoomId || rooms[0]?.id || "");
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ailment, setAilment] = useState("");
  const [notes, setNotes] = useState("");
  const [admissionDate, setAdmissionDate] = useState(todayStr);
  const [expectedDischargeDate, setExpectedDischargeDate] = useState(inThreeDays);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!roomId) {
      setErrorMsg("Please select a room.");
      return;
    }
    if (!name || age === "" || !phone || !ailment || !address) {
      setErrorMsg("Please fill in all mandatory patient fields.");
      return;
    }
    if (admissionDate >= expectedDischargeDate) {
      setErrorMsg("Expected discharge date must be after admission date.");
      return;
    }

    try {
      setSubmitting(true);
      await api.directAdmitPatient({
        roomId,
        admissionDate,
        expectedDischargeDate,
        notes,
        patient: {
          name,
          age: Number(age),
          gender,
          phone,
          address,
          ailment,
          notes,
        },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to admit patient.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoomObj = rooms.find((r) => r.id === roomId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <div>
            <div className="modal-title-wrap">
              <h2>Patient Admission & Booking</h2>
            </div>
            <p className="modal-sub">Register patient details and assign hospital room bed</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errorMsg && <div className="alert-error">{errorMsg}</div>}

          {/* Room Selection */}
          <div className="form-field">
            <label>Select Room / Ward *</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id} disabled={r.isUnderMaintenance}>
                  Room {r.roomNumber} - {r.ward} (Floor {r.floor}, {r.bedCount} beds)
                  {r.isUnderMaintenance ? " [UNDER MAINTENANCE]" : ` [${r.status.toUpperCase()}]`}
                </option>
              ))}
            </select>
            {selectedRoomObj && (
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Current Status: <strong>{selectedRoomObj.status}</strong>
              </span>
            )}
          </div>

          {/* Dates Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-field">
              <label>Admission Date *</label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Expected Discharge *</label>
              <input
                type="date"
                value={expectedDischargeDate}
                onChange={(e) => setExpectedDischargeDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Patient Details */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4 style={{ fontSize: "13.5px", color: "#334155" }}>Patient Information</h4>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
              <div className="form-field">
                <label>Patient Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Muhammed Shahad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Age *</label>
                <input
                  type="number"
                  placeholder="45"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-field">
                <label>Gender *</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as any)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98470 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Ailment / Diagnosis (Unani Diagnosis) *</label>
                <input
                  type="text"
                  placeholder="e.g. Chronic Migraine (Suda Muzmin)"
                  value={ailment}
                  onChange={(e) => setAilment(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Address *</label>
              <input
                type="text"
                placeholder="Residential Address / City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Therapy Regimen / Admission Notes</label>
              <textarea
                rows={2}
                placeholder="Prescribed Unani therapies (Hijama, Hammam, Dalk) or dietary instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Processing..." : "Confirm & Admit Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
