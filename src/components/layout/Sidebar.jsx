import { COLORS, NAV_ITEMS } from "../../constants/theme";
import { useStore, actions } from "../../store/index";
import lockedInLogo from "../../assets/lockedin-logo.png";

export function Sidebar() {
  const { state, dispatch } = useStore();
  const active = state.page;

  return (
    <aside style={{
      width: 180, minHeight: "100vh",
      background: COLORS.sidebar,
      display: "flex", flexDirection: "column",
      padding: "24px 0",
      borderRight: `1px solid ${COLORS.border}`,
      position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 10,
    }}>
      <div style={{ padding: "0 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            overflow: "hidden", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${COLORS.border}`,
          }}>
            <img
              src={lockedInLogo}
              alt="LockedIn logo"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>
          <div>
            <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
              LockedIn
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 10 }}>Focus OS</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch(actions.setPage(item.id))}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 20px", border: "none", cursor: "pointer",
                background: isActive ? `${COLORS.blue}22` : "transparent",
                color: isActive ? COLORS.text : COLORS.textSec,
                borderLeft: isActive
                  ? `3px solid ${COLORS.blue}`
                  : "3px solid transparent",
                fontFamily: "inherit", fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{
        padding: "16px 20px",
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>👤</div>
          <div>
            <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>
              {state.settings.userName}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 11 }}>
              {state.settings.userEmail}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
