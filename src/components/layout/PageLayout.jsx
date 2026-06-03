import { COLORS } from "../../constants/theme";
import { useViewport } from "../../hooks/useViewport";
import { SIDEBAR_W, TOPBAR_H } from "./Sidebar";

export function PageLayout({ children, centered = false }) {
  const { isMobile } = useViewport();

  return (
    <main style={{
      marginLeft: isMobile ? 0 : SIDEBAR_W,
      flex: 1,
      // Fill the space left of the fixed sidebar. Using width:100% here would
      // add to marginLeft and overflow 180px past the right edge, so we let
      // the block auto-size and just cap it with maxWidth.
      width: "auto",
      maxWidth: isMobile ? "100%" : `calc(100% - ${SIDEBAR_W}px)`,
      padding: isMobile
        ? `${TOPBAR_H + 16}px 16px 24px`
        : "28px 32px",
      minHeight: "100vh",
      boxSizing: "border-box",
      ...(centered && !isMobile ? {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      } : {}),
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
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 24,
    }}>
      <div>
        {subtitle && (
          <div style={{ color: COLORS.textSec, fontSize: 13, marginBottom: 4 }}>
            {subtitle}
          </div>
        )}
        <h1 style={{ color: COLORS.text, fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, margin: 0 }}>
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
