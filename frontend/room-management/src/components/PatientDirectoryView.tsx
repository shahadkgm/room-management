import React, { useState, useEffect, useCallback } from "react";
import type { Patient } from "../types";
import { api } from "../services/api";

interface PatientDirectoryViewProps {
  onOpenAdmission: () => void;
}

const PAGE_SIZE = 10;

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({ onOpenAdmission }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPatients = useCallback(async (page: number, searchTerm: string) => {
    try {
      setLoading(true);
      const result = await api.getPatients(searchTerm || undefined, page, PAGE_SIZE);
      setPatients(result.patients);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (e) {
      console.error("Error fetching patients:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset page to 1 on search change, then fetch
  useEffect(() => {
    setCurrentPage(1);
    fetchPatients(1, search);
  }, [search]);

  useEffect(() => {
    fetchPatients(currentPage, search);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

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
          + Register &amp; Admit Patient
        </button>
      </div>

      <div className="timeline-card">
        {/* Table header count */}
        {!loading && total > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
              Showing <strong style={{ color: "#0f172a" }}>{start}–{end}</strong> of <strong style={{ color: "#0f172a" }}>{total}</strong> patients
            </span>
          </div>
        )}

        {loading ? (
          <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Loading patients...</p>
        ) : patients.length === 0 ? (
          <p style={{ color: "var(--text-muted)", padding: "30px 0", textAlign: "center" }}>
            No patient records found.
          </p>
        ) : (
          <div className="table-responsive">
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
          </div>
        )}

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
          }}>
            <button
              id="patient-page-prev"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                background: currentPage === 1 ? "#f1f5f9" : "#fff",
                color: currentPage === 1 ? "#94a3b8" : "#0f172a",
                fontWeight: 600,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "13px",
                transition: "all 0.18s",
              }}
            >
              ← Previous
            </button>

            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                id={`patient-page-${p}`}
                onClick={() => handlePageChange(p)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: p === currentPage ? "none" : "1.5px solid #e2e8f0",
                  background: p === currentPage ? "linear-gradient(135deg, #0d9488, #0f766e)" : "#fff",
                  color: p === currentPage ? "#fff" : "#334155",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.18s",
                }}
              >
                {p}
              </button>
            ))}

            <button
              id="patient-page-next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                background: currentPage === totalPages ? "#f1f5f9" : "#fff",
                color: currentPage === totalPages ? "#94a3b8" : "#0f172a",
                fontWeight: 600,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "13px",
                transition: "all 0.18s",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
