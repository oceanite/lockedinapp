import { COLORS } from "../constants/theme";
import { Card, Badge } from "../components/ui/index";
import {
  AxisLineChart, AxisBarChart, StackedBarChart,
  HourlyHeatmap, CircleProgress,
} from "../components/ui/Charts";
import { PageLayout, PageHeader } from "../components/layout/PageLayout";
import {
  useAnalytics, DAYS, QUADRANT_STACK, fmtHour,
} from "../hooks/useAnalytics";

const LEGEND_ORDER = [...QUADRANT_STACK].reverse();

function niceTicks(defaultTicks, data) {
  const max = Math.max(...data, 0);
  const cap = defaultTicks[defaultTicks.length - 1];
  if (max <= cap) return defaultTicks;
  const step = defaultTicks[1] - defaultTicks[0];
  const newMax = Math.ceil(max / step) * step;
  return [0, newMax / 3, (2 * newMax) / 3, newMax].map(n => +n.toFixed(0));
}

export default function AnalyticsPage() {
  const a = useAnalytics();

  return (
    <PageLayout centered>
      <PageHeader title="Analytics" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <KpiCard
          icon="⏱"
          label="Total Deep Work (Weekly)"
          value={a.totalDeepWorkLabel}
          delta="+20%"
          accent={COLORS.green}
          chart={
            <AxisLineChart
              data={a.deepWorkByDay} days={DAYS}
              color={COLORS.green}
              yTicks={niceTicks([0, 8, 16, 24], a.deepWorkByDay)}
              ySuffix="h"
              fill
            />
          }
        />
        <KpiCard
          icon="◎"
          label="Avg. Focus Session Length"
          value={`${a.avgFocusMin}m`}
          delta="+10%"
          accent={COLORS.green}
          chart={
            <AxisBarChart
              data={a.avgFocusByDay} days={DAYS}
              color={COLORS.green}
              yTicks={niceTicks([0, 30, 60, 90], a.avgFocusByDay)}
              ySuffix="m"
            />
          }
        />
        <KpiCard
          icon="!"
          label="Distractions Blocked"
          value={`${a.distractionAttempts} Attempts`}
          accent={COLORS.red}
          chart={
            <AxisBarChart
              data={a.distractionsByDay} days={DAYS}
              color={COLORS.red}
              yTicks={niceTicks([0, 10, 20, 30], a.distractionsByDay)}
            />
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <TaskExecutionCard a={a} />
        <HeatmapCard a={a} />
      </div>
    </PageLayout>
  );
}

function KpiCard({ icon, label, value, delta, accent, chart }) {
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ color: accent, fontSize: 14 }}>{icon}</span>
        <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{ color: COLORS.text, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</span>
        {delta && <Badge color={COLORS.green}>↑ {delta}</Badge>}
      </div>
      {chart}
    </Card>
  );
}

function TaskExecutionCard({ a }) {
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        Analisis Eksekusi Tugas
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{
          background: COLORS.bg, borderRadius: 10, padding: 10,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <CircleProgress value={a.completionRate} size={42} color={COLORS.green} />
          <div>
            <div style={{ color: COLORS.textSec, fontSize: 10, lineHeight: 1.3 }}>
              Tingkat Penyelesaian<br />Tugas Minggu Ini
            </div>
            <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 14, marginTop: 2 }}>
              {Math.round(a.completionRate * 100)}% Selesai
            </div>
          </div>
        </div>
        <div style={{
          background: COLORS.bg, borderRadius: 10, padding: 10,
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 2,
        }}>
          <div style={{ color: COLORS.textSec, fontSize: 10, lineHeight: 1.3 }}>
            Tugas Selesai (Minggu Ini)
          </div>
          <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 18 }}>
            ✓ {a.totalDoneWeek} Tugas
          </div>
        </div>
      </div>

      <div style={{ color: COLORS.text, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
        Penyelesaian Tugas Harian berdasarkan Kategori Urgensi
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
        <div style={{ width: "65%", justifySelf: "center" }}>
          <StackedBarChart
            series={a.dailyByQuadrant}
            days={DAYS}
            yLabel="Jumlah Tugas"
          />
          <div style={{ color: COLORS.textMuted, fontSize: 9, textAlign: "center", marginTop: 2 }}>
            Harian (Mon – Sun)
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {LEGEND_ORDER.map(q => (
            <div key={q.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: q.color }} />
              <span style={{ color: COLORS.textSec, fontSize: 10 }}>{q.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function HeatmapCard({ a }) {
  const hasData = a.peakHours.length > 0 || a.peakDays.length > 0;
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
        Hourly Focus Heatmap & Peak Times
      </div>

      {/* heatmap centered horizontally, kept at intrinsic pixel size */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <HourlyHeatmap data={a.heatmap} days={DAYS} gray={COLORS.heatEmpty} active={COLORS.green} />
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
          Your Peak Focus Times:
        </div>
        {a.peakHours.length === 0
          ? <Empty text="Not enough sessions yet" />
          : a.peakHours.map((r, i) => (
              <Bullet key={i} color={COLORS.green}
                text={`${fmtHour(r.from)} – ${fmtHour(r.to)}`} />
            ))}

        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 12, margin: "8px 0 4px" }}>
          Your Peak Focus Days:
        </div>
        {a.peakDays.length === 0
          ? <Empty text="Run more sessions to see your peak days" />
          : a.peakDays.map(d => (
              <Bullet key={d} color={COLORS.blue} text={d} />
            ))}

        {!hasData && (
          <div style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 6 }}>
            Complete some focus sessions in the Focus Room to populate these stats.
          </div>
        )}
      </div>
    </Card>
  );
}

function Bullet({ text, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{ color: COLORS.textSec, fontSize: 11 }}>{text}</span>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ color: COLORS.textMuted, fontSize: 10, marginBottom: 3 }}>{text}</div>;
}
