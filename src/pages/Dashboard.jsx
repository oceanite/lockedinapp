import { useState } from "react";
import { COLORS, QUADRANTS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import { Card, PrimaryButton } from "../components/ui/index";
import { EnergyGauge } from "../components/ui/Charts";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";
import { useAnalytics } from "../hooks/useAnalytics";

const TOP_ROW_HEIGHT = 300;

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const { tasks } = state;

  const [sceneryUrl] = useState(() => {
    const n = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/lockedin-${n}/720/360`;
  });

  const topTask = tasks.doNow[0]?.text || "No urgent tasks";

  return (
    <PageLayout>
      <PageHeader
        title="Hello, Name!"
        action={
          <PrimaryButton onClick={() => dispatch(actions.setPage("task"))}>
            + Add Task
          </PrimaryButton>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 0, overflow: "hidden", height: TOP_ROW_HEIGHT, position: "relative" }}>
          <img
            src={sceneryUrl}
            alt=""
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", display: "block",
            }}
          />
          {/* dark gradient so the text stays readable on any image */}
          <div style={{
            position: "absolute", inset: 0,
            background:
              "linear-gradient(to top, rgba(8,10,20,0.92) 0%, rgba(8,10,20,0.45) 45%, rgba(8,10,20,0) 75%)",
          }} />
          <div style={{
            position: "absolute", left: 22, right: 22, bottom: 18,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          }}>
            <div style={{
              fontSize: 11, color: COLORS.accent, fontWeight: 700,
              letterSpacing: 2, marginBottom: 6,
            }}>
              TODAY'S FOCUS
            </div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
              {topTask}
            </div>
            <div style={{ color: "#D6DBEA", fontSize: 13, marginTop: 4 }}>
              {tasks.doNow.length} urgent · {tasks.schedule.length} scheduled
            </div>
          </div>
        </Card>

        <EnergyCard onLockIn={() => dispatch(actions.setPage("focus"))} height={TOP_ROW_HEIGHT} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <UrgencyMatrixPreview
          tasks={tasks}
          onAttack={() => dispatch(actions.setPage("task"))}
          onToggle={(quadrant, id) => dispatch(actions.toggleTask(quadrant, id))}
        />
        <AnalyticsSummaryCard onTrack={() => dispatch(actions.setPage("analytics"))} />
      </div>
    </PageLayout>
  );
}

function EnergyCard({ onLockIn, height }) {
  const energy   = 26;   // current energy (gauge value)
  const progress = 68;   // today's progress toward goal (battery bar)
  const stats = [
    { label: "Daily Target",      value: "2 / 5", color: COLORS.orange },
    { label: "Current Streak",    value: "7",     color: COLORS.green  },
    { label: "Cooldown (minute)", value: "60",    color: COLORS.green  },
  ];

  return (
    <Card style={{
      padding: 14, height,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10,
      }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15 }}>⏱ Energy Tracker</div>
        <button onClick={onLockIn} style={{
          background: COLORS.green, color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 16px",
          fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
        }}>Lock In</button>
      </div>

      {/* progress + stats + gauge — grouped in an inner panel */}
      <div style={{
        flex: 1,
        background: `${COLORS.bg}aa`, border: `1px solid ${COLORS.border}`,
        borderRadius: 12, padding: "10px 12px",
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="lamp-blink" style={{
              width: 8, height: 8, borderRadius: "50%",
              background: COLORS.green, color: COLORS.green,
            }} />
            <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 700 }}>Today's Progress</span>
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2, marginBottom: 10 }}>
            Last updated at 7:30 PM
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {stats.map((s, i) => (
              <Stat key={s.label} stat={s} withDivider={i > 0} />
            ))}
          </div>
        </div>

        <EnergyGauge value={energy} label="Low" size={86} textColor={COLORS.text} />
      </div>

      {/* battery bar inner panel */}
      <div style={{
        background: `${COLORS.bg}aa`, border: `1px solid ${COLORS.border}`,
        borderRadius: 12, padding: "8px 12px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span className="bolt-flicker" style={{ color: COLORS.green, fontSize: 14 }}>⚡</span>
        <BatteryBar value={progress} />
        <span style={{
          color: COLORS.text, fontSize: 12, fontWeight: 700,
          minWidth: 36, textAlign: "right",
        }}>{progress}%</span>
      </div>
    </Card>
  );
}

function Stat({ stat, withDivider }) {
  return (
    <>
      {withDivider && (
        <div style={{
          width: 1, alignSelf: "stretch",
          background: COLORS.border, margin: "0 10px",
        }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: stat.color, fontWeight: 800, fontSize: 20, lineHeight: 1,
        }}>{stat.value}</div>
        <div style={{
          color: COLORS.textSec, fontSize: 10, marginTop: 4, lineHeight: 1.2,
        }}>{stat.label}</div>
      </div>
    </>
  );
}

function BatteryBar({ value, segments = 28, color = COLORS.green }) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);
  return (
    <div style={{ flex: 1, display: "flex", gap: 2, alignItems: "center", height: 16 }}>
      {Array.from({ length: segments }).map((_, i) => {
        const on = i < filled;
        return (
          <div
            key={i}
            className={on ? "an-cell" : undefined}
            style={{
              flex: 1, height: "100%",
              background: on ? color : `${color}33`,
              borderRadius: 1.5,
              animationDelay: on ? `${i * 0.03}s` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function UrgencyMatrixPreview({ tasks, onAttack, onToggle }) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15 }}>✓ Urgency Matrix</div>
        <button onClick={onAttack} style={{
          background: COLORS.red, color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 16px",
          fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
        }}>Attack Stats</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {QUADRANTS.map(q => (
          <div key={q.key} style={{
            background: `${q.color}22`, border: `1px solid ${q.color}44`,
            borderRadius: 12, padding: 12, minHeight: 92,
          }}>
            <div style={{ color: q.color, fontWeight: 700, fontSize: 13, marginBottom: 8, textAlign: "center" }}>
              {q.label}
            </div>
            {tasks[q.key].length === 0
              ? <div style={{ color: COLORS.textMuted, fontSize: 12, textAlign: "center" }}>No tasks</div>
              : tasks[q.key].slice(0, 3).map(t => (
                <div
                  key={t.id}
                  onClick={() => onToggle(q.key, t.id)}
                  style={{
                    display: "flex", gap: 6, alignItems: "center", marginBottom: 4,
                    cursor: "pointer", userSelect: "none",
                  }}
                >
                  <div style={{
                    width: 14, height: 14,
                    border: `1.5px solid ${t.done ? q.color : COLORS.textSec}`,
                    borderRadius: 3, flexShrink: 0,
                    background: t.done ? q.color : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {t.done && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{
                    color: t.done ? COLORS.textMuted : COLORS.text, fontSize: 12,
                    textDecoration: t.done ? "line-through" : "none",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{t.text}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnalyticsSummaryCard({ onTrack }) {
  const a = useAnalytics();
  const cards = [
    { icon: "⏱", label: "Total Deep Work",     value: a.totalDeepWorkLabel,          sub: "this week",            color: COLORS.purple },
    { icon: "◎", label: "Avg. Focus Session",  value: `${a.avgFocusMin}m`,           sub: "this week",            color: COLORS.green  },
    { icon: "🛡", label: "Distraction Avoided", value: String(a.distractionAttempts), sub: "attempts prevented",   color: COLORS.red    },
    { icon: "📈", label: "Peak Focus Time",    value: a.peakHourLabel,               sub: "highest productivity", color: COLORS.accent },
  ];
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15 }}>▦ Analytics Summary</div>
        <button onClick={onTrack} style={{
          background: COLORS.blue, color: "#fff",
          border: "none", borderRadius: 8,
          padding: "6px 16px", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
        }}>Track Growth</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cards.map(s => (
          <div key={s.label} style={{
            position: "relative",
            background: `${COLORS.bg}88`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10, padding: "10px 12px",
          }}>
            <span style={{
              position: "absolute", top: 8, right: 10,
              color: s.color, fontSize: 12, opacity: 0.7,
            }}>↗</span>
            <div style={{ fontSize: 18, color: s.color, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ color: COLORS.textSec, fontSize: 10, marginBottom: 2 }}>{s.label}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
