import { COLORS } from "../../constants/theme";

export function Badge({ children, color = COLORS.blue }) {
  return (
    <span style={{
      background: `${color}22`, color,
      padding: "4px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>
      {children}
    </span>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: COLORS.card,
      borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      padding: "20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, color = COLORS.green }) {
  return (
    <div style={{ height: 8, background: `${color}22`, borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        width: `${value}%`, height: "100%", background: color,
        borderRadius: 4, transition: "width 0.5s ease",
      }} />
    </div>
  );
}

export function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 46, height: 26, borderRadius: 13,
        background: on ? COLORS.blue : `${COLORS.border}88`,
        cursor: "pointer", position: "relative", transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: on ? 23 : 3,
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)",
      }} />
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      color: "#00E5FF", fontSize: 11, fontWeight: 700,
      letterSpacing: 1.5, marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

export function Select({ value, onChange, options, style = {} }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: COLORS.bg ?? "#0D0F1E",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8, padding: "7px 30px 7px 12px",
        color: COLORS.text, fontFamily: "inherit",
        fontSize: 13, cursor: "pointer", minWidth: 110,
        ...style,
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function PrimaryButton({ children, onClick, color, style = {} }) {
  const bg = color || COLORS.blue;
  return (
    <button
      onClick={onClick}
      style={{
        background: bg, color: "#fff", border: "none",
        borderRadius: 12, padding: "10px 20px",
        fontFamily: "inherit", fontWeight: 700,
        fontSize: 14, cursor: "pointer", ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", color: COLORS.text,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12, padding: "10px 20px",
        fontFamily: "inherit", fontWeight: 600,
        fontSize: 14, cursor: "pointer", ...style,
      }}
    >
      {children}
    </button>
  );
}
