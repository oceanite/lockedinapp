import { COLORS } from "../../constants/theme";

export function PageLayout({ children }) {
  return (
    <main style={{
      marginLeft: 180,
      flex: 1,
      padding: "28px 32px",
      maxWidth: "100%",
      minHeight: "100vh",
    }}>
      {children}
    </main>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 28,
    }}>
      <div>
        {subtitle && (
          <div style={{ color: COLORS.textSec, fontSize: 13, marginBottom: 4 }}>
            {subtitle}
          </div>
        )}
        <h1 style={{ color: COLORS.text, fontSize: 28, fontWeight: 800, margin: 0 }}>
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
