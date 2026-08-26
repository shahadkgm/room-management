import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    danger: { emoji: "⚠️", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    warning: { emoji: "🔔", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    info: { emoji: "ℹ️", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  };

  const { emoji, color, bg, border } = iconMap[variant];

  const confirmBgMap = {
    danger: "linear-gradient(135deg, #dc2626, #b91c1c)",
    warning: "linear-gradient(135deg, #d97706, #b45309)",
    info: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          animation: "slideUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Badge */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: bg,
              border: `2px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
            }}
          >
            {emoji}
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 8px 0",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#475569",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: confirmBgMap[variant],
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: `0 3px 10px ${color}40`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
