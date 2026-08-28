import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { User } from "../types";
import { useAuth } from "../context/AuthContext";
import { ConfirmModal } from "./ConfirmModal";

export const UserManagementView: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: "approve" | "revoke" | "delete" | null;
    targetUser: User | null;
  }>({ open: false, type: null, targetUser: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <div className="view-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Access Denied</h1>
            <p className="page-subtitle" style={{ color: "#ef4444" }}>You must be an administrator to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAction = async () => {
    const { type, targetUser } = confirmState;
    if (!targetUser || !type) return;

    setConfirmState({ open: false, type: null, targetUser: null });

    try {
      if (type === "delete") {
        await api.deleteUser(targetUser.id);
      } else {
        const isAllowed = type === "approve";
        await api.updateUserAllowance(targetUser.id, isAllowed);
      }
      fetchUsers();
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const getConfirmProps = () => {
    const { type, targetUser } = confirmState;
    if (!targetUser) return { title: "", message: "", confirmLabel: "", variant: "danger" as const };
    if (type === "delete") return {
      title: "Delete User",
      message: `Are you sure you want to permanently delete user ${targetUser.name}? This cannot be undone.`,
      confirmLabel: "Yes, Delete",
      variant: "danger" as const,
    };
    const isApprove = type === "approve";
    return {
      title: isApprove ? "Approve User" : "Revoke Access",
      message: isApprove
        ? `Are you sure you want to approve access for ${targetUser.name}? They will be able to log into the system.`
        : `Are you sure you want to revoke access for ${targetUser.name}? They will be immediately blocked from logging in.`,
      confirmLabel: isApprove ? "Yes, Approve" : "Yes, Revoke",
      variant: isApprove ? "info" as const : "warning" as const,
    };
  };

  const confirmProps = getConfirmProps();

  return (
    <div className="view-container">
      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmProps.title}
        message={confirmProps.message}
        confirmLabel={confirmProps.confirmLabel}
        cancelLabel="Go Back"
        variant={confirmProps.variant}
        onConfirm={handleAction}
        onCancel={() => setConfirmState({ open: false, type: null, targetUser: null })}
      />

      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Approve new users and manage system access.</p>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "20px" }}>{error}</div>}

      <div className="timeline-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading users...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="timeline-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Access Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{u.name}</td>
                    <td style={{ color: "#475569" }}>{u.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          background:
                            u.role === "admin"
                              ? "#ecfdf5"
                              : u.role === "visitor"
                              ? "#f3e8ff"
                              : "#fffbeb",
                          color:
                            u.role === "admin"
                              ? "#059669"
                              : u.role === "visitor"
                              ? "#9333ea"
                              : "#d97706",
                          border: `1px solid ${
                            u.role === "admin"
                              ? "#a7f3d0"
                              : u.role === "visitor"
                              ? "#d8b4fe"
                              : "#fde68a"
                          }`,
                        }}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.isAllowed ? (
                        <span style={{ color: "#059669", fontWeight: 600, fontSize: "13px" }}>✅ Allowed</span>
                      ) : (
                        <span style={{ color: "#ef4444", fontWeight: 600, fontSize: "13px" }}>🚫 Pending/Revoked</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          disabled={u.id === user?.id}
                          onClick={() => setConfirmState({ open: true, type: u.isAllowed ? "revoke" : "approve", targetUser: u })}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "6px",
                            border: `1px solid ${u.isAllowed ? "#fde68a" : "#bfdbfe"}`,
                            background: u.isAllowed ? "#fffbeb" : "#eff6ff",
                            color: u.isAllowed ? "#d97706" : "#2563eb",
                            cursor: u.id === user?.id ? "not-allowed" : "pointer",
                            opacity: u.id === user?.id ? 0.5 : 1
                          }}
                        >
                          {u.isAllowed ? "Revoke Access" : "Approve Access"}
                        </button>
                        <button
                          disabled={u.id === user?.id}
                          onClick={() => setConfirmState({ open: true, type: "delete", targetUser: u })}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            borderRadius: "6px",
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#dc2626",
                            cursor: u.id === user?.id ? "not-allowed" : "pointer",
                            opacity: u.id === user?.id ? 0.5 : 1
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
