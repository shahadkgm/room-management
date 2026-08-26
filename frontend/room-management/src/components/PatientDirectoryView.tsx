import React, { useState, useEffect } from "react";
import type { Patient } from "../types";
import { api } from "../services/api";

interface PatientDirectoryViewProps {
  onOpenAdmission: () => void;
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({ onOpenAdmission }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getPatients(search);
      setPatients(data);
    } catch (e) {
      console.error("Error fetching patients:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="summary-legend-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: "400px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search patient by name, ailment, phone..."
            className="search-input"
            style={{ width: "100%" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={onOpenAdmission}>
          + Register & Admit Patient
        </button>
      </div>

      <div className="timeline-card">
        {loading ? (
          <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Loading patients...</p>
        ) : patients.length === 0 ? (
          <p style={{ color: "var(--text-muted)", padding: "30px 0", textAlign: "center" }}>
            No patient records found.
          </p>
        ) : (
          <table className="timeline-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age / Gender</th>
                <th>Phone</th>
                <th>Unani Ailment / Diagnosis</th>
                <th>Assigned Room</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ background: "#ecfdf5", color: "#059669", padding: "4px 8px", borderRadius: "50%", fontSize: "12px" }}>
                        👤
                      </span>
                      {p.name}
                    </div>
                  </td>
                  <td style={{ color: "#334155" }}>
                    {p.age} yrs · {p.gender}
                  </td>
                  <td style={{ color: "#334155" }}>{p.phone}</td>
                  <td style={{ color: "#0d9488", fontWeight: 600 }}>{p.ailment}</td>
                  <td>
                    {p.currentRoom ? (
                      <span className="badge badge-occupied">
                        Room {p.currentRoom.roomNumber} ({p.currentRoom.ward})
                      </span>
                    ) : (
                      <span style={{ color: "#64748b" }}>Discharged</span>
                    )}
                  </td>
                  <td style={{ fontSize: "12px", color: "#475569" }}>{p.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
