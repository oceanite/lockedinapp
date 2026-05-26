import { useMemo } from "react";
import { COLORS } from "../constants/theme";
import { ANALYTICS_DATA } from "../constants/data";
import { generateHeatmap } from "../utils/helpers";
import { Card, Badge } from "../components/ui/index";
import { MiniLineChart, MiniBarChart, HeatmapCell, DayLabels, CircleProgress } from "../components/ui/Charts";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";

const TOP_CARDS = [
  { icon: "⏱", label: "Total Deep Work (Weekly)", value: "53h 45m", badge: "+20%", color: COLORS.blue,  type: "line" },
  { icon: "◎", label: "Avg. Focus Session Length", value: "338m",   badge: "+10%", color: COLORS.green, type: "bar"  },
  { icon: "🛡", label: "Distractions Blocked",      value: "98",     badge: null,   color: COLORS.red,   type: "bar"  },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  const heatmap = useMemo(() => generateHeatmap(), []);
  const d = ANALYTICS_DATA;

  return (
    <PageLayout>
      <PageHeader title="Analytics" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        {TOP_CARDS.map(c => (
          <Card key={c.label}>
            <div style={{ color: COLORS.textSec, fontSize: 12, marginBottom: 6 }}>{c.icon} {c.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ color: COLORS.text, fontSize: 22, fontWeight: 800 }}>{c.value}</span>
              {c.badge && <Badge color={COLORS.green}>↑ {c.badge}</Badge>}
            </div>
            {c.type === "line"
              ? <MiniLineChart data={d.deepWork}     color={c.color} />
              : <MiniBarChart  data={c.label.includes("Dis") ? d.distractions : d.focusSession} color={c.color} />}
            <DayLabels days={d.days} />
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TaskExecutionCard />
        <HeatmapCard heatmap={heatmap} />
      </div>
    </PageLayout>
  );
}

function TaskExecutionCard() {
  const quadColors = [COLORS.red, COLORS.orange, COLORS.green, "#4A5578"];
  return (
    <Card>
      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
        Analisis Eksekusi Tugas
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: COLORS.bg, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: COLORS.textSec, fontSize: 11, marginBottom: 8 }}>Tingkat Penyelesaian</div>
          <CircleProgress value={0.75} size={60} color={COLORS.green} />
        </div>
        <div style={{ background: COLORS.bg, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ color: COLORS.textSec, fontSize: 11, marginBottom: 6 }}>Tugas Selesai (Minggu Ini)</div>
          <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 20 }}>✓ 16 Tugas</div>
        </div>
      </div>

      <div style={{ color: COLORS.textSec, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
        Penyelesaian Harian per Kategori
      </div>

      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
        <div key={day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 10, width: 24 }}>{day}</span>
          <div style={{ flex: 1, height: 12, display: "flex", borderRadius: 4, overflow: "hidden" }}>
            {quadColors.map((c, ci) => (
              <div key={ci} style={{ flex: Math.random() * 3 + 0.5, background: c, opacity: 0.85 }} />
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        {[["Do Now", COLORS.red], ["Schedule", COLORS.orange], ["Delegate", COLORS.green], ["Delete", "#4A5578"]].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            <span style={{ color: COLORS.textMuted, fontSize: 10 }}>{l}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HeatmapCard({ heatmap }) {
  return (
    <Card>
      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
        Hourly Focus Heatmap & Peak Times
      </div>

      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <div style={{ display: "flex", marginBottom: 4, paddingLeft: 28 }}>
          {[0, 4, 8, 12, 16, 20, 24].map(h => (
            <div key={h} style={{ flex: h === 0 ? 0 : 1, color: COLORS.textMuted, fontSize: 9 }}>{h}h</div>
          ))}
        </div>
        {heatmap.map((row, di) => (
          <div key={di} style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <span style={{ color: COLORS.textMuted, fontSize: 9, width: 24 }}>{DAY_LABELS[di]}</span>
            <div style={{ display: "flex" }}>
              {row.map((v, hi) => <HeatmapCell key={hi} intensity={v} />)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
          Your Peak Focus Times:
        </div>
        {["09:00 AM – 11:00 AM", "22:00 PM – 02:00 AM"].map(t => (
          <Bullet key={t} text={t} color={COLORS.green} />
        ))}
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13, margin: "10px 0 6px" }}>
          Your Peak Focus Days:
        </div>
        {["Saturday", "Sunday"].map(t => (
          <Bullet key={t} text={t} color={COLORS.blue} />
        ))}
      </div>
    </Card>
  );
}

function Bullet({ text, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{ color: COLORS.textSec, fontSize: 12 }}>{text}</span>
    </div>
  );
}
