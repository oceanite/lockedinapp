import { COLORS, QUADRANTS } from "../constants/theme";
import { useStore, actions } from "../store/index";
import { todayLabel } from "../utils/helpers";
import { Card, Badge, ProgressBar, PrimaryButton } from "../components/ui/index";
import { EnergyGauge } from "../components/ui/Charts";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";

const ANALYTICS_CARDS = [
  { icon: "⏱", label: "Total Deep Work",      value: "53h 45m", sub: "this week",             color: "#9B59FF" },
  { icon: "◎", label: "Avg. Focus Session",   value: "48m",     sub: "this week",             color: "#00C48C" },
  { icon: "🛡", label: "Distraction Avoided",  value: "98",      sub: "attempts prevented",    color: "#FF4D4D" },
  { icon: "📈", label: "Peak Focus Time",      value: "09–12",   sub: "highest productivity",  color: "#00E5FF" },
];

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const { tasks } = state;

  return (
    <PageLayout>
      <PageHeader
        title="Hello, Name! 👋"
        subtitle={todayLabel()}
        action={
          <PrimaryButton onClick={() => dispatch(actions.setPage("task"))}>
            + Add Task
          </PrimaryButton>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 }}>
        <Card style={{ padding: 0, overflow: "hidden", minHeight: 200 }}>
          <div style={{
            height: "100%", minHeight: 200,
            background: "linear-gradient(135deg,#0D1B4B 0%,#1a1464 50%,#0D0F1E 100%)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: 24, position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle at 70% 30%,#3B5BFF22,transparent 60%)",
            }} />
            <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>
              TODAY'S FOCUS
            </div>
            <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 700 }}>
              {tasks.doNow[0]?.text || "No urgent tasks"}
            </div>
            <div style={{ color: COLORS.textSec, fontSize: 13, marginTop: 4 }}>
              {tasks.doNow.length} urgent · {tasks.schedule.length} scheduled
            </div>
          </div>
        </Card>

        <EnergyCard onLockIn={() => dispatch(actions.setPage("focus"))} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <UrgencyMatrixPreview tasks={tasks} onAttack={() => dispatch(actions.setPage("analytics"))} />
        <AnalyticsSummaryCard onTrack={() => dispatch(actions.setPage("analytics"))} />
      </div>
    </PageLayout>
  );
}

function EnergyCard({ onLockIn }) {
  const energy = 68;
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15 }}>⏱ Energy Tracker</div>
        <button onClick={onLockIn} style={{
          background: COLORS.green, color: "#fff", border: "none",
          borderRadius: 8, padding: "5px 14px",
          fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
        }}>Lock In</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green }} />
        <span style={{ color: COLORS.textSec, fontSize: 12 }}>Today's Progress · Last updated 7:30 PM</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Daily Target",    value: "2 / 5", color: COLORS.orange },
              { label: "Streak",          value: "7",     color: COLORS.green  },
              { label: "Cooldown (m)",    value: "60",    color: COLORS.accent },
            ].map(s => (
              <div key={s.label}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: 20 }}>{s.value}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 10 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <EnergyGauge value={energy} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <ProgressBar value={energy} color={COLORS.green} />
        <span style={{ color: COLORS.textSec, fontSize: 12, minWidth: 32 }}>{energy}%</span>
      </div>
      <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4, textAlign: "right" }}>Low</div>
    </Card>
  );
}

function UrgencyMatrixPreview({ tasks, onAttack }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15 }}>✓ Urgency Matrix</div>
        <button onClick={onAttack} style={{
          background: COLORS.red, color: "#fff", border: "none",
          borderRadius: 8, padding: "5px 14px",
          fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
        }}>Attack Stats</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {QUADRANTS.map(q => (
          <div key={q.key} style={{
            background: `${q.color}22`, border: `1px solid ${q.color}44`,
            borderRadius: 12, padding: 14,
          }}>
            <div style={{ color: q.color, fontWeight: 700, fontSize: 13, marginBottom: 8, textAlign: "center" }}>
              {q.label}
            </div>
            {tasks[q.key].length === 0
              ? <div style={{ color: COLORS.textMuted, fontSize: 12, textAlign: "center" }}>No tasks</div>
              : tasks[q.key].slice(0, 3).map(t => (
                <div key={t.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <div style={{ width: 12, height: 12, border: `1.5px solid ${COLORS.textSec}`, borderRadius: 2 }} />
                  <span style={{ color: COLORS.text, fontSize: 12 }}>{t.text}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnalyticsSummaryCard({ onTrack }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15 }}>▦ Analytics Summary</div>
        <button onClick={onTrack} style={{
          background: "transparent", color: COLORS.text,
          border: `1px solid ${COLORS.border}`, borderRadius: 8,
          padding: "5px 14px", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer",
        }}>Track Growth</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ANALYTICS_CARDS.map(s => (
          <div key={s.label} style={{ background: `${COLORS.bg}88`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ color: COLORS.textSec, fontSize: 10, marginBottom: 2 }}>{s.label}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 10 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
