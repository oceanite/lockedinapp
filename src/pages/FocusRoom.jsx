import { useState, useRef, useEffect, useMemo } from "react";
import { COLORS, QUICK_PICKS, MUSIC_PRESETS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import { useTimer } from "../hooks/useTimer";
import { Card } from "../components/ui/index";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";
import { SynthEngine, playAlarm, primeAudio } from "../utils/audio";
import { useViewport } from "../hooks/useViewport";

// timed presets shown in the mode bar (labels are built from settings)
const PRESET_MODES = [
  { id: "pomodoro", name: "Pomodoro",    setting: "focusDuration", fallback: 25 },
  { id: "short",    name: "Short Break", setting: "shortBreak",    fallback: 5  },
  { id: "long",     name: "Long Break",  setting: "longBreak",     fallback: 15 },
];

function toMin(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const FOCUS_TIPS = [
  "Work in 25-minute sprints then take a 5-minute break. After 4 sessions, take a longer 15-minute break.",
  "Remove your phone from the room. Out of sight, out of mind.",
  "One task at a time. Close all unrelated browser tabs before starting.",
  "Use the first 2 minutes to clarify exactly what 'done' looks like for this session.",
];

export default function FocusRoom() {
  const { state, dispatch } = useStore();
  const { isMobile } = useViewport();
  const [tipIndex] = useState(() => Math.floor(Math.random() * FOCUS_TIPS.length));
  // which side-panel tab is open: "session" | "block" | "music" | "history"
  const [activePanel, setActivePanel] = useState("session");
  // session-complete popup payload ({ label, durationSecs }) or null
  const [completed, setCompleted] = useState(null);
  const customInputRef = useRef(null);

  const soundOn = state.settings?.sound !== false;

  // Focus Room presets follow the durations set in Settings.
  const settings = state.settings;
  const presetMins = {
    pomodoro: toMin(settings.focusDuration, 25),
    short:    toMin(settings.shortBreak, 5),
    long:     toMin(settings.longBreak, 15),
  };
  const presets = useMemo(() => ({
    pomodoro: presetMins.pomodoro * 60,
    short:    presetMins.short * 60,
    long:     presetMins.long * 60,
  }), [presetMins.pomodoro, presetMins.short, presetMins.long]);

  // jump into custom mode and focus the minute field
  const startCustom = () => {
    timer.switchMode("custom");
    setTimeout(() => customInputRef.current?.focus(), 0);
  };

  const timer = useTimer({
    presets,
    onComplete: () => {
      // Reward: base 10 + 1 point per focused minute. Breaks earn the base only.
      const mins = Math.round(timer.totalSecs / 60);
      const isBreak = timer.mode === "short" || timer.mode === "long";
      const earned = isBreak ? 5 : 10 + mins;

      const finished = {
        label: labelForMode(timer.mode, timer.customMin),
        durationSecs: timer.totalSecs,
        mode: timer.mode,
        earned,
      };
      dispatch(actions.incrementSessions());
      dispatch(actions.addPoints(earned));
      // focus sessions drain energy (−1% per 2 min); breaks don't
      if (!isBreak) dispatch(actions.drainEnergy(mins));
      dispatch(actions.addTimerHistory({
        id: Date.now(),
        mode: timer.mode,
        label: finished.label,
        durationSecs: timer.totalSecs,
        completedAt: new Date().toISOString(),
        status: "completed",
      }));
      // pause any music so the alarm is heard clearly
      SynthEngine.stop();
      if (soundOn) playAlarm({ volume: 0.5, repeats: 3 });
      fireBrowserNotification(finished, state.settings);
      setCompleted(finished);
    },
  });

  const circumference = 2 * Math.PI * 110;
  const dashOffset = circumference - (timer.progress / 100) * circumference;

  const activeBlockedCount = state.blockedSites.filter(s => s.active).length;

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

      {/* MODE BAR — presets, then Custom with quick-pick shortcuts beside it */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {PRESET_MODES.map(m => (
          <ModeButton key={m.id}
            active={timer.mode === m.id}
            onClick={() => timer.switchMode(m.id)}>
            {m.name} · {presetMins[m.id]}m
          </ModeButton>
        ))}
        <span style={{
          width: 1, height: 22, background: COLORS.border, margin: "0 4px",
        }} />
        <ModeButton
          active={timer.mode === "custom"}
          onClick={startCustom}>
          ✎ Custom
        </ModeButton>
        {QUICK_PICKS.map(min => {
          const isActive = timer.mode === "custom" && timer.customMin === min;
          return (
            <button key={min}
              onClick={() => timer.applyQuickPick(min)}
              style={{
                background: isActive ? COLORS.blue : "transparent",
                color: isActive ? "#fff" : COLORS.textSec,
                border: `1px solid ${isActive ? COLORS.blue : COLORS.border}`,
                borderRadius: 10, padding: "8px 14px",
                fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>
              {min}m
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 20, alignItems: "start" }}>
        {/* TIMER CARD */}
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px 28px", position: "relative" }}>
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
                  : timer.mode === "custom" ? `Custom · ${timer.customMin}m`
                  : "Break Time"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {timer.mode === "custom" && (
              <div
                className={!timer.running ? "duration-glow" : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: COLORS.bg,
                  border: `1px solid ${timer.running ? COLORS.border : COLORS.blue}`,
                  borderRadius: 12, padding: "6px 10px",
                  "--glow": `${COLORS.blue}55`,
                }}>
                <span style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 600 }}>Set</span>
                <input
                  ref={customInputRef}
                  type="number" min={1} max={180}
                  value={timer.customMin}
                  onChange={e => timer.setCustomDuration(+e.target.value)}
                  style={{
                    width: 44, background: "transparent", border: "none",
                    color: COLORS.text, fontFamily: "inherit",
                    fontSize: 16, fontWeight: 800, textAlign: "center",
                    outline: "none",
                  }}
                />
                <span style={{ color: COLORS.textSec, fontSize: 12 }}>min</span>
              </div>
            )}
            <button onClick={() => {
              // user gesture → unlock the audio context for the alarm later
              primeAudio();
              const wasRunning = timer.running;
              if (!wasRunning && timer.seconds === timer.totalSecs) {
                // fresh start: bank recovery up to now, then log "started"
                dispatch(actions.settleEnergy());
                dispatch(actions.addTimerHistory({
                  id: Date.now(),
                  mode: timer.mode,
                  label: labelForMode(timer.mode, timer.customMin),
                  durationSecs: timer.totalSecs,
                  completedAt: new Date().toISOString(),
                  status: "started",
                }));
              }
              timer.setRunning(r => !r);
            }} style={{
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

          {/* RUNNING STATUS STRIP */}
          {timer.running && (
            <div style={{
              marginTop: 22, display: "flex", gap: 14, fontSize: 12,
              color: COLORS.textSec, flexWrap: "wrap", justifyContent: "center",
            }}>
              {activeBlockedCount > 0 && (
                <StatusChip color={COLORS.red}>
                  🚫 {activeBlockedCount} site{activeBlockedCount > 1 ? "s" : ""} blocked
                </StatusChip>
              )}
              {state.musicState.selectedId && (
                <StatusChip color={COLORS.accent}>
                  🎧 {nowPlayingLabel(state.musicState.selectedId)}
                </StatusChip>
              )}
            </div>
          )}
        </Card>

        {/* RIGHT-COLUMN: labeled tabs + the active panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PanelTabs
            active={activePanel}
            onChange={setActivePanel}
            blockedCount={activeBlockedCount}
            musicOn={!!state.musicState.selectedId}
          />
          {activePanel === "session" && (
            <>
              <SessionLog sessions={state.sessions} history={state.timerHistory} />
              <TipCard tip={FOCUS_TIPS[tipIndex]} />
            </>
          )}
          {activePanel === "block"   && <WebsiteBlockerPanel />}
          {activePanel === "music"   && <MusicPanel />}
          {activePanel === "history" && <HistoryPanel />}
        </div>
      </div>

      {/* hidden audio player for music */}
      <MusicEngine />

      {/* session-complete popup */}
      {completed && (
        <CompletionModal
          info={completed}
          sessions={state.sessions}
          totalPoints={state.points}
          onClose={() => setCompleted(null)}
          onRestart={() => {
            setCompleted(null);
            primeAudio();
            timer.reset();
            timer.setRunning(true);
          }}
        />
      )}
    </PageLayout>
  );
}

// best-effort desktop notification (no-op if unsupported or denied)
function fireBrowserNotification(info, settings) {
  if (settings?.notifications === false) return;
  if (typeof Notification === "undefined") return;
  const show = () => {
    try {
      new Notification("Focus session complete! 🎉", {
        body: `${info.label} · ${Math.round(info.durationSecs / 60)} min done. Time for a break.`,
      });
    } catch { /* some browsers require a SW for notifications */ }
  };
  if (Notification.permission === "granted") show();
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(p => { if (p === "granted") show(); });
  }
}

function CompletionModal({ info, sessions, totalPoints, onClose, onRestart }) {
  const mins = Math.round(info.durationSecs / 60);
  // close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(8,10,20,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: 18, padding: "28px 28px 22px", width: 340, maxWidth: "90vw",
          textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
          background: `${COLORS.green}22`, border: `2px solid ${COLORS.green}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
        }}>🎉</div>

        <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
          Session Complete!
        </div>
        <div style={{ color: COLORS.textSec, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
          You finished <strong style={{ color: COLORS.text }}>{info.label}</strong> ·{" "}
          <strong style={{ color: COLORS.text }}>{mins} min</strong>.<br />
          That's <strong style={{ color: COLORS.green }}>{sessions}</strong> session{sessions === 1 ? "" : "s"} today. Nice work!
        </div>

        {/* points reward */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: `${COLORS.yellow}14`, border: `1px solid ${COLORS.yellow}44`,
          borderRadius: 12, padding: "10px 12px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{ color: COLORS.yellow, fontWeight: 800, fontSize: 16 }}>+{info.earned} points</span>
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>· total {totalPoints}</span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onRestart} style={{
            flex: 1, background: COLORS.blue, color: "#fff", border: "none",
            borderRadius: 12, padding: "11px 0",
            fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer",
          }}>▶ Start Another</button>
          <button onClick={onClose} style={{
            flex: 1, background: "transparent", color: COLORS.textSec,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12, padding: "11px 0",
            fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function labelForMode(mode) {
  if (mode === "pomodoro") return "Pomodoro";
  if (mode === "short")    return "Short Break";
  if (mode === "long")     return "Long Break";
  if (mode === "custom")   return "Custom";
  return mode;
}

// Display name for a stored history entry, derived from its mode so the
// duration (shown separately) is never duplicated — works for old entries too.
function cleanLabel(h) {
  switch (h.mode) {
    case "pomodoro": return "Pomodoro";
    case "short":    return "Short Break";
    case "long":     return "Long Break";
    case "custom":   return "Custom";
    default:         return h.label || h.mode || "Session";
  }
}

function nowPlayingLabel(id) {
  const preset = MUSIC_PRESETS.find(t => t.id === id);
  if (preset) return preset.label;
  // custom track ids look like "custom-<ts>"
  return "Custom track";
}

function formatRelative(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)      return `${diff}s ago`;
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

function normalizeUrl(raw) {
  const t = raw.trim().toLowerCase();
  if (!t) return "";
  return t
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

// ─────────────────────────────────────────────────────────────
// Small atoms
// ─────────────────────────────────────────────────────────────

function ModeButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? COLORS.blue : COLORS.card,
      color: active ? "#fff" : COLORS.textSec,
      border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
      borderRadius: 10, padding: "8px 16px",
      fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer",
    }}>{children}</button>
  );
}

function StatusChip({ children, color }) {
  return (
    <span style={{
      background: `${color}1a`, color,
      border: `1px solid ${color}44`,
      borderRadius: 999, padding: "4px 10px",
      fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
    }}>{children}</span>
  );
}

function PanelHeader({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{title}</div>
      {onClose && (
        <button onClick={onClose} style={{
          width: 24, height: 24, borderRadius: 6,
          background: "transparent", color: COLORS.textSec,
          border: `1px solid ${COLORS.border}`,
          cursor: "pointer", fontSize: 12, lineHeight: 1,
        }}>×</button>
      )}
    </div>
  );
}

// Labeled tab bar for the side panel — clearly navigational (not on/off toggles).
function PanelTabs({ active, onChange, blockedCount, musicOn }) {
  const tabs = [
    { id: "session", label: "Session", glyph: <SessionGlyph /> },
    { id: "block",   label: "Blocker", glyph: <BlockGlyph />,       badge: blockedCount },
    { id: "music",   label: "Music",   glyph: <HeadphonesGlyph />,  dot: musicOn },
    { id: "history", label: "History", glyph: <HistoryGlyph /> },
  ];
  return (
    <div style={{
      display: "flex", gap: 4,
      background: COLORS.card, border: `1px solid ${COLORS.border}`,
      borderRadius: 14, padding: 5,
    }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} title={t.label} style={{
            flex: 1, position: "relative",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "8px 2px", borderRadius: 10, border: "none", cursor: "pointer",
            background: on ? COLORS.blue : "transparent",
            color: on ? "#fff" : COLORS.textSec,
            fontFamily: "inherit", fontWeight: 700, fontSize: 11,
            transition: "background 0.15s, color 0.15s",
          }}>
            {t.glyph}
            <span>{t.label}</span>
            {t.badge > 0 && (
              <span style={{
                position: "absolute", top: 3, right: "50%", marginRight: -22,
                background: COLORS.red, color: "#fff",
                fontSize: 9, fontWeight: 800, minWidth: 15, height: 15,
                borderRadius: 8, padding: "0 3px",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${on ? COLORS.blue : COLORS.card}`,
              }}>{t.badge}</span>
            )}
            {t.dot && !t.badge && (
              <span style={{
                position: "absolute", top: 5, right: "50%", marginRight: -20,
                width: 8, height: 8, borderRadius: "50%", background: COLORS.green,
                border: `2px solid ${on ? COLORS.blue : COLORS.card}`,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SVG glyphs (preserve palette; no emojis here so the icons stay crisp)
// ─────────────────────────────────────────────────────────────

function BlockGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function HeadphonesGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 14v-2a8 8 0 0116 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="13" width="5" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="13" width="5" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function HistoryGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 109-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline points="3,4 3,9 8,9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="12,7 12,12 15,14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function SessionGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BackGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M10 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12h13a5 5 0 015 5v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Website Blocker
// ─────────────────────────────────────────────────────────────

function WebsiteBlockerPanel({ onClose }) {
  const { state, dispatch } = useStore();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = (e) => {
    e?.preventDefault?.();
    const url = normalizeUrl(input);
    if (!url) { setError("Enter a website URL"); return; }
    if (!/\./.test(url)) { setError("That doesn't look like a domain"); return; }
    if (state.blockedSites.some(s => s.url === url)) {
      setError("Already on the list");
      return;
    }
    dispatch(actions.addBlockedSite({
      id: Date.now(),
      url,
      active: true,
    }));
    setInput("");
    setError("");
  };

  return (
    <Card>
      <PanelHeader title="Website Blocker" />
      <div style={{ color: COLORS.textSec, fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        Type a site you want to avoid, then press <strong style={{ color: COLORS.text }}>Add</strong>.
      </div>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 4,
          background: COLORS.bg,
          border: `1px solid ${error ? COLORS.red : COLORS.border}`,
          borderRadius: 8, padding: "0 6px 0 10px",
        }}>
          <input
            type="text"
            placeholder="e.g. instagram.com"
            value={input}
            onChange={e => { setInput(e.target.value); setError(""); }}
            style={{
              flex: 1, minWidth: 0, background: "transparent", border: "none",
              padding: "8px 0", outline: "none",
              color: COLORS.text, fontFamily: "inherit", fontSize: 13,
            }}
          />
          {input && (
            <button
              type="button"
              onClick={() => { setInput(""); setError(""); }}
              title="Clear"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: "transparent", border: `1px solid ${COLORS.border}`,
                color: COLORS.textSec, cursor: "pointer",
              }}
            ><BackGlyph /></button>
          )}
        </div>
        <button type="submit" style={{
          background: COLORS.blue, color: "#fff", border: "none",
          borderRadius: 8, padding: "8px 14px",
          fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
        }}>＋ Add</button>
      </form>
      {error && <div style={{ color: COLORS.red, fontSize: 11, marginBottom: 8 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
        {state.blockedSites.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 12, padding: "12px 0" }}>
            No sites blocked yet.
          </div>
        )}
        {state.blockedSites.map(site => (
          <div key={site.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: COLORS.bg, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, padding: "8px 10px",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: site.active ? COLORS.red : COLORS.textMuted,
              flexShrink: 0,
            }} />
            <span style={{
              color: site.active ? COLORS.text : COLORS.textMuted,
              fontSize: 12, flex: 1,
              textDecoration: site.active ? "none" : "line-through",
              wordBreak: "break-all",
            }}>{site.url}</span>
            <button
              onClick={() => dispatch(actions.toggleBlockedSite(site.id))}
              title={site.active ? "Disable" : "Enable"}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.border}`,
                color: site.active ? COLORS.green : COLORS.textMuted,
                borderRadius: 6, padding: "2px 8px",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
              }}>{site.active ? "ON" : "OFF"}</button>
            <button
              onClick={() => dispatch(actions.removeBlockedSite(site.id))}
              title="Remove"
              style={{
                background: "transparent", border: "none",
                color: COLORS.textMuted, cursor: "pointer",
                fontSize: 16, lineHeight: 1, padding: "0 4px",
              }}>×</button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Music Panel + Engine
// In-memory custom tracks (object URLs aren't persistable across reloads).
// ─────────────────────────────────────────────────────────────

const customTrackStore = {
  tracks: [],          // [{ id, label, url, file }]
  listeners: new Set(),
  notify() { this.listeners.forEach(fn => fn(this.tracks)); },
  add(track) { this.tracks = [...this.tracks, track]; this.notify(); },
  remove(id) {
    const t = this.tracks.find(x => x.id === id);
    if (t?.url) URL.revokeObjectURL(t.url);
    this.tracks = this.tracks.filter(x => x.id !== id);
    this.notify();
  },
  get(id) { return this.tracks.find(x => x.id === id); },
};

function useCustomTracks() {
  const [tracks, setTracks] = useState(customTrackStore.tracks);
  useEffect(() => {
    customTrackStore.listeners.add(setTracks);
    return () => customTrackStore.listeners.delete(setTracks);
  }, []);
  return tracks;
}

function MusicPanel({ onClose }) {
  const { state, dispatch } = useStore();
  const customTracks = useCustomTracks();
  const fileInputRef = useRef(null);

  const selected = state.musicState.selectedId;

  const select = (id) => {
    dispatch(actions.updateMusicState({
      selectedId: selected === id ? null : id,
    }));
  };

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      customTrackStore.add({ id, label: f.name.replace(/\.[^.]+$/, ""), url, file: f });
    });
    e.target.value = "";
  };

  return (
    <Card>
      <PanelHeader title="Choose Music" onClose={onClose} />

      {/* preset tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {MUSIC_PRESETS.map(t => {
          const active = selected === t.id;
          return (
            <button key={t.id} onClick={() => select(t.id)} style={{
              background: active ? t.color : `${t.color}1a`,
              border: `1px solid ${active ? t.color : `${t.color}55`}`,
              color: active ? "#fff" : t.color,
              borderRadius: 12, padding: "14px 12px",
              fontFamily: "inherit", fontWeight: 700, fontSize: 13,
              cursor: "pointer", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 6,
              minHeight: 72, lineHeight: 1.2,
              transition: "background 0.15s",
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* custom upload */}
      <div style={{
        background: COLORS.bg, border: `1px dashed ${COLORS.border}`,
        borderRadius: 10, padding: 10, marginBottom: 10,
      }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
          Your Tracks
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 8 }}>
          Upload audio from your device (mp3, wav, ogg).
        </div>
        <input ref={fileInputRef} type="file" accept="audio/*" multiple
          onChange={onFiles} style={{ display: "none" }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%", background: `${COLORS.blue}22`,
            border: `1px solid ${COLORS.blue}55`, color: COLORS.accent,
            borderRadius: 8, padding: "8px 10px",
            fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
          }}>+ Add from device</button>

        {customTracks.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10, maxHeight: 140, overflowY: "auto" }}>
            {customTracks.map(t => {
              const active = selected === t.id;
              return (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: active ? `${COLORS.blue}22` : "transparent",
                  border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
                  borderRadius: 8, padding: "6px 8px",
                }}>
                  <span style={{ fontSize: 14 }}>🎵</span>
                  <button onClick={() => select(t.id)} style={{
                    flex: 1, background: "transparent", border: "none",
                    color: active ? COLORS.text : COLORS.textSec,
                    fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                    textAlign: "left", cursor: "pointer",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{t.label}</button>
                  <button onClick={() => {
                    if (selected === t.id) dispatch(actions.updateMusicState({ selectedId: null }));
                    customTrackStore.remove(t.id);
                  }} style={{
                    background: "transparent", border: "none",
                    color: COLORS.textMuted, cursor: "pointer",
                    fontSize: 14, lineHeight: 1, padding: "0 2px",
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: COLORS.textSec, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>VOL</span>
        <input
          type="range" min={0} max={100}
          value={Math.round(state.musicState.volume * 100)}
          onChange={e => dispatch(actions.updateMusicState({ volume: +e.target.value / 100 }))}
          style={{ flex: 1, accentColor: COLORS.blue }}
        />
        <span style={{ color: COLORS.textMuted, fontSize: 11, width: 28, textAlign: "right" }}>
          {Math.round(state.musicState.volume * 100)}
        </span>
      </div>
    </Card>
  );
}

// MusicEngine plays the selected track.
//  • custom uploads  → played via a hidden <audio> element
//  • preset "vibes"  → synthesized looping ambient pad (Web Audio)
function MusicEngine() {
  const { state } = useStore();
  const audioRef = useRef(null);
  const { selectedId, volume, loop } = state.musicState;

  const selectedTrack = useMemo(() => {
    if (!selectedId) return null;
    if (selectedId.startsWith("custom-")) return customTrackStore.get(selectedId) || null;
    return null;
  }, [selectedId]);

  const isPreset = SynthEngine.isPreset(selectedId);

  // custom-track playback
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (selectedTrack?.url) {
      if (a.src !== selectedTrack.url) a.src = selectedTrack.url;
      a.loop = loop;
      a.volume = volume;
      a.play().catch(() => { /* autoplay may be blocked until user gesture */ });
    } else {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
  }, [selectedTrack, loop]);

  // preset synth playback
  useEffect(() => {
    if (isPreset) {
      SynthEngine.start(selectedId, volume);
    } else {
      SynthEngine.stop();
    }
    // stop synth on unmount
    return () => { if (!isPreset) SynthEngine.stop(); };
  }, [selectedId, isPreset]);

  // keep both engines in sync with the volume slider
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (isPreset) SynthEngine.setVolume(volume);
  }, [volume, isPreset]);

  // stop everything when the component unmounts (leaving Focus Room)
  useEffect(() => {
    return () => SynthEngine.stop();
  }, []);

  return <audio ref={audioRef} style={{ display: "none" }} />;
}

// ─────────────────────────────────────────────────────────────
// History Panel
// ─────────────────────────────────────────────────────────────

function HistoryPanel({ onClose }) {
  const { state, dispatch } = useStore();
  const items = state.timerHistory;
  const completedCount = items.filter(h => h.status === "completed").length;
  const totalFocusMin  = Math.round(
    items.filter(h => h.status === "completed").reduce((sum, h) => sum + h.durationSecs, 0) / 60
  );

  return (
    <Card>
      <PanelHeader title="Timer History" onClose={onClose} />

      {/* summary */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Stat label="Completed" value={completedCount} color={COLORS.green} />
        <Stat label="Focus min" value={totalFocusMin} color={COLORS.blue} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
        {items.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 12, padding: "12px 0" }}>
            No timer sessions yet. Start one!
          </div>
        )}
        {items.map(h => (
          <div key={h.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: COLORS.bg, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, padding: "8px 10px",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: h.status === "completed" ? COLORS.green : COLORS.orange,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: COLORS.text, fontSize: 12, fontWeight: 600,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{cleanLabel(h)} · {Math.round(h.durationSecs / 60)}m</div>
              <div style={{ color: COLORS.textMuted, fontSize: 10 }}>
                {h.status === "completed" ? "Completed" : "Started"} · {formatRelative(h.completedAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <button onClick={() => {
          if (confirm("Clear all timer history?")) dispatch(actions.clearTimerHistory());
        }} style={{
          marginTop: 12, width: "100%",
          background: "transparent", color: COLORS.textMuted,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8, padding: "8px 10px",
          fontFamily: "inherit", fontWeight: 600, fontSize: 11, cursor: "pointer",
        }}>Clear history</button>
      )}
    </Card>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{
      flex: 1,
      background: `${color}11`, border: `1px solid ${color}33`,
      borderRadius: 10, padding: "8px 10px",
    }}>
      <div style={{ color, fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ color: COLORS.textSec, fontSize: 10, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Default right-column cards (kept from prior version)
// ─────────────────────────────────────────────────────────────

function SessionLog({ sessions, history = [] }) {
  const today = new Date().toISOString().slice(0, 10);
  // actual completed sessions today, newest first (history is already newest-first)
  const todays = history.filter(
    h => h.status === "completed" && h.completedAt.slice(0, 10) === today
  );

  return (
    <Card>
      <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>Today's Sessions</div>
      {todays.length === 0
        ? <div style={{ color: COLORS.textMuted, fontSize: 12 }}>
            {sessions > 0 ? "Session history cleared." : "No sessions yet. Start your first one!"}
          </div>
        : todays.slice(0, 6).map((h, i) => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, flexShrink: 0 }} />
            <span style={{
              color: COLORS.textSec, fontSize: 12,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{cleanLabel(h)} · {Math.round(h.durationSecs / 60)}m</span>
            <span style={{ color: COLORS.green, fontSize: 10, marginLeft: "auto", flexShrink: 0 }}>✓</span>
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
