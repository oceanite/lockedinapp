import { useState, useEffect } from "react";
import { COLORS, NAV_ITEMS } from "../../constants/theme";
import { useStore, actions } from "../../store/index";
import { useViewport } from "../../hooks/useViewport";
import lockedInLogo from "../../assets/lockedin-logo.png";

export const SIDEBAR_W = 180;
export const TOPBAR_H = 54;

export function Sidebar() {
  const { state, dispatch } = useStore();
  const { isMobile } = useViewport();
  const active = state.page;
  const [open, setOpen] = useState(false);

  // close the drawer whenever we leave mobile
  useEffect(() => { if (!isMobile) setOpen(false); }, [isMobile]);
  // lock body scroll while the drawer is open
  useEffect(() => {
    if (isMobile && open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobile, open]);

  const go = (id) => { dispatch(actions.setPage(id)); setOpen(false); };

  const Logo = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        overflow: "hidden", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${COLORS.border}`, flexShrink: 0,
      }}>
        <img src={lockedInLogo} alt="LockedIn logo"
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
      </div>
      <div>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>LockedIn</div>
        <div style={{ color: COLORS.textMuted, fontSize: 10 }}>Focus OS</div>
      </div>
    </div>
  );

  const nav = (
    <nav style={{ flex: 1 }}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => go(item.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 20px", border: "none", cursor: "pointer",
              background: isActive ? `${COLORS.blue}22` : "transparent",
              color: isActive ? COLORS.text : COLORS.textSec,
              borderLeft: isActive ? `3px solid ${COLORS.blue}` : "3px solid transparent",
              fontFamily: "inherit", fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              transition: "all 0.15s", textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  const profile = (
    <div style={{ padding: "16px 20px", borderTop: `1px solid ${COLORS.border}` }}>
      <button
        onClick={() => go("settings")}
        title="Open account settings"
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          background: active === "settings" ? `${COLORS.blue}22` : "transparent",
          border: "none", borderRadius: 10, padding: "6px 8px",
          cursor: "pointer", textAlign: "left", fontFamily: "inherit",
          transition: "background 0.15s",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: COLORS.card, border: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>👤</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            color: COLORS.text, fontSize: 13, fontWeight: 600,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{state.settings.userName}</div>
          <div style={{
            color: COLORS.textMuted, fontSize: 11,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{state.settings.userEmail}</div>
        </div>
      </button>
    </div>
  );

  // ── DESKTOP / TABLET: fixed rail ──────────────────────────
  if (!isMobile) {
    return (
      <aside style={{
        width: SIDEBAR_W, minHeight: "100vh",
        background: COLORS.sidebar,
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        borderRight: `1px solid ${COLORS.border}`,
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 10,
      }}>
        <div style={{ padding: "0 20px 32px" }}>{Logo}</div>
        {nav}
        {profile}
      </aside>
    );
  }

  // ── MOBILE: top bar + slide-in drawer ─────────────────────
  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: TOPBAR_H, zIndex: 30,
        background: COLORS.sidebar, borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", gap: 12, padding: "0 14px",
      }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: "transparent", border: `1px solid ${COLORS.border}`,
            color: COLORS.text, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, lineHeight: 1, flexShrink: 0,
          }}
        >{open ? "✕" : "☰"}</button>
        {Logo}
      </header>

      {/* backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(1px)",
          }}
        />
      )}

      {/* drawer */}
      <aside style={{
        width: SIDEBAR_W + 20, maxWidth: "82vw", height: "100vh",
        background: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`,
        display: "flex", flexDirection: "column", padding: "20px 0",
        position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50,
        transform: open ? "translateX(0)" : "translateX(-105%)",
        transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
      }}>
        <div style={{ padding: "0 20px 24px" }}>{Logo}</div>
        {nav}
        {profile}
      </aside>
    </>
  );
}
