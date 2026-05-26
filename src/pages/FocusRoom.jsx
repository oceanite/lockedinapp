import { useState } from "react";
import { COLORS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import { useTimer } from "../hooks/useTimer";
import { Card } from "../components/ui/index";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";

const MODES = [
  { id: "pomodoro", label: "Pomodoro · 25m" },
  { id: "short",    label: "Short Break · 5m" },
  { id: "long",     label: "Long Break · 15m" },
  { id: "custom",   label: "Custom" },
];

const FOCUS_TIPS = [
  "Work in 25-minute sprints then take a 5-minute break. After 4 sessions, take a longer 15-minute break.",
  "Remove your phone from the room. Out of sight, out of mind.",
  "One task at a time. Close all unrelated browser tabs before starting.",
  "Use the first 2 minutes to clarify exactly what 'done' looks like for this session.",
];

export default function FocusRoom() {
  const { state, dispatch } = useStore();
  const [tipIndex] = useState(() => Math.floor(Math.random() * FOCUS_TIPS.length));

  const timer = useTimer({
    onComplete: () => dispatch(actions.incrementSessions()),
  });

  const circumference = 2 * Math.PI * 110;
  const dashOffset = circumference - (timer.progress / 100) * circumference;

  return (
    <PageLayout>
      <PageHeader
        title="Focus Room"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: COLORS.textSec, fontSize: 13 }}>
              Sessions today: <strong style={{ color: COLORS.text }}>{state.sessions}</strong>
            </span>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => timer.switchMode(m.id)} style={{
            background: timer.mode === m.id ? COLORS.blue : COLORS.card,
            color: timer.mode === m.id ? "#fff" : COLORS.textSec,
            border: `1px solid ${timer.mode === m.id ? COLORS.blue : COLORS.border}`,
            borderRadius: 10, padding: "8px 16px",
            fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>{m.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
          <div style={{ position: "relative", marginBottom: 32 }}>
            <svg width={260} height={260}>
              <circle cx={130} cy={130} r={110} fill="none"
                stroke={`${COLORS.blue}22`} strokeWidth={12} />
              <circle cx={130} cy={130} r={110} fill="none"
                stroke={COLORS.blue} strokeWidth={12}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 130 130)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }} />
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)", textAlign: "center",
            }}>
              <div style={{
                color: COLORS.text, fontSize: 52, fontWeight: 800,
                fontFamily: "monospace", lineHeight: 1,
              }}>
                {timer.display.mins}:{timer.display.secs}
              </div>
              <div style={{ color: COLORS.textSec, fontSize: 13, marginTop: 6 }}>
                {timer.mode === "pomodoro" ? "Focus Time"
                  : timer.mode === "custom" ? "Custom Timer"
                  : "Break Time"}
              </div>
            </div>
          </div>

          {timer.mode === "custom" && (
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ color: COLORS.textSec, fontSize: 13 }}>Minutes:</label>
              <input
                type="number" min={1} max={120}
                value={timer.customMin}
                onChange={e => timer.setCustomDuration(+e.target.value)}
                style={{
                  width: 70, background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, padding: "6px 10px",
                  color: COLORS.text, fontFamily: "inherit",
                  fontSize: 14, textAlign: "center",
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => timer.setRunning(r => !r)} style={{
              background: timer.running ? `${COLORS.orange}22` : COLORS.blue,
              color: timer.running ? COLORS.orange : "#fff",
              border: timer.running ? `1px solid ${COLORS.orange}` : "none",
              borderRadius: 12, padding: "12px 32px",
              fontFamily: "inherit", fontWeight: 800, fontSize: 16,
              cursor: "pointer", minWidth: 120,
            }}>
              {timer.running ? "⏸ Pause" : "▶ Start"}
            </button>
            <button onClick={timer.reset} style={{
              background: "transparent", color: COLORS.textSec,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12, padding: "12px 20px",
              fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>↺ Reset</button>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SessionLog sessions={state.sessions} />
          <TipCard tip={FOCUS_TIPS[tipIndex]} />
        </div>
      </div>
    </PageLayout>
  );
}

function SessionLog({ sessions }) {
  return (
    <Card>
      <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>Today's Sessions</div>
      {sessions === 0
        ? <div style={{ color: COLORS.textMuted, fontSize: 12 }}>No sessions yet. Start your first one!</div>
        : [...Array(Math.min(sessions, 6))].map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green }} />
            <span style={{ color: COLORS.textSec, fontSize: 12 }}>Session {i + 1} · 25m</span>
            <span style={{ color: COLORS.green, fontSize: 10, marginLeft: "auto" }}>✓</span>
          </div>
        ))}
    </Card>
  );
}

function TipCard({ tip }) {
  return (
    <Card style={{ background: `${COLORS.blue}11`, border: `1px solid ${COLORS.blue}33` }}>
      <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
        FOCUS TIP
      </div>
      <div style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.6 }}>{tip}</div>
    </Card>
  );
}
