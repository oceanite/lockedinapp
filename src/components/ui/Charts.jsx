export function MiniLineChart({ data, color, maxY }) {
  const w = 200, h = 60, pad = 4;
  const max = maxY || Math.max(...data) || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color}
        strokeWidth={2} strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - (v / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}

export function MiniBarChart({ data, color }) {
  const w = 200, h = 60, pad = 4;
  const max = Math.max(...data) || 1;
  const barW = (w - pad * 2) / data.length - 2;
  return (
    <svg width={w} height={h}>
      {data.map((v, i) => {
        const x = pad + i * ((w - pad * 2) / data.length) + 1;
        const barH = (v / max) * (h - pad * 2);
        const y = h - pad - barH;
        return <rect key={i} x={x} y={y} width={barW} height={barH} fill={color} rx={2} />;
      })}
    </svg>
  );
}

export function CircleProgress({ value = 0.75, size = 60, color = "#00C48C" }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const target = circ * (1 - Math.max(0, Math.min(1, value))); // final offset
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`${color}33`} strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={target}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="an-ring"
        style={{ "--dash-from": circ, "--dash-to": target }} />
    </svg>
  );
}

/**
 * Speedometer-style tick gauge — radial dashes around a center value.
 * Filled ticks color = `color`, unfilled = dim gray.
 */
export function EnergyGauge({
  value = 0, label = "", size = 92,
  color = "#00C48C", labelColor = "#FFD60A", textColor = "#fff",
  ticks = 40,
}) {
  const v = Math.max(0, Math.min(100, value));
  const filled = Math.round((v / 100) * ticks);
  const cx = size / 2, cy = size / 2;
  const rOuter = size / 2 - 3;
  const rInner = size / 2 - 12;

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {Array.from({ length: ticks }).map((_, i) => {
        // start at top (12 o'clock), go clockwise
        const angle = (i / ticks) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + rInner * Math.cos(angle);
        const y1 = cy + rInner * Math.sin(angle);
        const x2 = cx + rOuter * Math.cos(angle);
        const y2 = cy + rOuter * Math.sin(angle);
        const active = i < filled;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={active ? color : "#4A557855"}
            strokeWidth={2.2} strokeLinecap="round"
            className="an-tick"
            style={{ animationDelay: `${i * 0.014}s` }} />
        );
      })}
      <text x={cx} y={label ? cy - 2 : cy + 6} textAnchor="middle"
        fill={textColor} fontSize={20} fontWeight={800}
        dominantBaseline="middle">{v}</text>
      {label && (
        <text x={cx} y={cy + 14} textAnchor="middle"
          fill={labelColor} fontSize={10} fontWeight={700}>{label}</text>
      )}
    </svg>
  );
}

export function HeatmapCell({ intensity }) {
  const stops = ["#1A1E3A", "#1E3A5F", "#1E5FAA", "#3B5BFF", "#00C48C"];
  const idx = Math.min(Math.floor(intensity * 5), 4);
  return (
    <div style={{ width: 13, height: 13, borderRadius: 2, background: stops[idx], margin: 1 }} />
  );
}

export function DayLabels({ days }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
      {days.map(d => (
        <span key={d} style={{ color: "#4A5578", fontSize: 9 }}>{d}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Axis-aware charts for the Analytics page.
// All use a viewBox so they scale to whatever container width is.
// ─────────────────────────────────────────────────────────────

function buildYTicks(maxVal, steps = 4) {
  if (maxVal <= 0) return [0, 1, 2, 3];
  // round max to a "nice" multiple based on magnitude
  const pow = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const niceMax = Math.ceil(maxVal / pow) * pow;
  return Array.from({ length: steps }, (_, i) =>
    +(niceMax * (i / (steps - 1))).toFixed(2)
  );
}

export function AxisLineChart({ data, days, color = "#00C48C", yTicks, ySuffix = "", fill = false }) {
  const w = 280, h = 125;
  const padL = 26, padR = 8, padT = 10, padB = 20;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const ticks = yTicks ?? buildYTicks(Math.max(...data, 1));
  const maxY = ticks[ticks.length - 1] || 1;

  const points = data.map((v, i) => {
    const x = padL + (data.length > 1 ? (i / (data.length - 1)) : 0.5) * innerW;
    const y = padT + innerH - (v / maxY) * innerH;
    return { x, y };
  });

  // unique-ish gradient id so multiple instances on a page don't collide
  const gradId = `axline-grad-${(color || "").replace(/[^a-zA-Z0-9]/g, "")}`;
  const baselineY = padT + innerH;
  const areaPath = points.length > 0
    ? `M ${points[0].x},${baselineY} `
      + `L ${points.map(p => `${p.x},${p.y}`).join(" L ")} `
      + `L ${points[points.length - 1].x},${baselineY} Z`
    : "";

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {fill && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0.04} />
          </linearGradient>
        </defs>
      )}
      {ticks.map(t => {
        const y = padT + innerH - (t / maxY) * innerH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y}
              stroke="rgba(136,146,176,0.18)" strokeWidth={0.6} />
            <text x={padL - 6} y={y + 3} textAnchor="end"
              fill="#8892B0" fontSize={9}>{t}{ySuffix}</text>
          </g>
        );
      })}
      {fill && areaPath && (
        <path className="an-area" d={areaPath} fill={`url(#${gradId})`} />
      )}
      <polyline className="an-line" pathLength={1}
        points={points.map(p => `${p.x},${p.y}`).join(" ")}
        fill="none" stroke={color} strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color}
          className="an-dot"
          style={{ animationDelay: `${0.55 + i * 0.07}s` }} />
      ))}
      {days.map((d, i) => {
        const x = padL + (days.length > 1 ? (i / (days.length - 1)) : 0.5) * innerW;
        return <text key={d} x={x} y={h - 6} textAnchor="middle"
          fill="#4A5578" fontSize={9}>{d}</text>;
      })}
    </svg>
  );
}

export function AxisBarChart({ data, days, color = "#00C48C", yTicks, ySuffix = "" }) {
  const w = 280, h = 125;
  const padL = 26, padR = 8, padT = 10, padB = 20;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const ticks = yTicks ?? buildYTicks(Math.max(...data, 1));
  const maxY = ticks[ticks.length - 1] || 1;
  const slot = innerW / data.length;
  const barW = Math.min(18, slot * 0.55);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {ticks.map(t => {
        const y = padT + innerH - (t / maxY) * innerH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y}
              stroke="rgba(136,146,176,0.18)" strokeWidth={0.6} />
            <text x={padL - 6} y={y + 3} textAnchor="end"
              fill="#8892B0" fontSize={9}>{t}{ySuffix}</text>
          </g>
        );
      })}
      {data.map((v, i) => {
        const cx = padL + slot * (i + 0.5);
        const barH = (v / maxY) * innerH;
        return (
          <rect key={i} x={cx - barW / 2} y={padT + innerH - barH}
            width={barW} height={Math.max(barH, 0)} rx={2.5} fill={color}
            className="an-bar" style={{ animationDelay: `${i * 0.06}s` }} />
        );
      })}
      {days.map((d, i) => {
        const cx = padL + slot * (i + 0.5);
        return <text key={d} x={cx} y={h - 6} textAnchor="middle"
          fill="#4A5578" fontSize={9}>{d}</text>;
      })}
    </svg>
  );
}

function buildIntegerTicks(maxVal) {
  if (maxVal <= 4)  return [0, 1, 2, 3, 4];
  if (maxVal <= 5)  return [0, 1, 2, 3, 4, 5];
  if (maxVal <= 10) return [0, 2, 4, 6, 8, 10];
  if (maxVal <= 15) return [0, 3, 6, 9, 12, 15];
  if (maxVal <= 20) return [0, 4, 8, 12, 16, 20];
  const step = Math.ceil(maxVal / 5);
  return [0, step, 2 * step, 3 * step, 4 * step, 5 * step];
}

/**
 * StackedBarChart — segments stacked bottom→top per day.
 * series = [{ key, label, color, data: number[7] }, ...]
 * stacking order matches array order: series[0] is bottom-most.
 */
export function StackedBarChart({ series, days, yTicks, yLabel = "" }) {
  const w = 320, h = 155;
  const padL = 30, padR = 8, padT = 10, padB = 28;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const totals = days.map((_, di) =>
    series.reduce((s, srs) => s + (srs.data[di] || 0), 0)
  );
  const ticks = yTicks ?? buildIntegerTicks(Math.max(...totals, 1));
  const maxY = ticks[ticks.length - 1] || 1;
  const slot = innerW / days.length;
  const barW = Math.min(22, slot * 0.55);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {yLabel && (
        <text x={10} y={padT + innerH / 2} textAnchor="middle"
          fill="#8892B0" fontSize={9}
          transform={`rotate(-90 10 ${padT + innerH / 2})`}>{yLabel}</text>
      )}
      {ticks.map(t => {
        const y = padT + innerH - (t / maxY) * innerH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={padL + innerW} y2={y}
              stroke="rgba(136,146,176,0.18)" strokeWidth={0.6} />
            <text x={padL - 6} y={y + 3} textAnchor="end"
              fill="#8892B0" fontSize={9}>{t}</text>
          </g>
        );
      })}
      {days.map((d, di) => {
        const cx = padL + slot * (di + 0.5);
        let cursorY = padT + innerH; // baseline
        return (
          <g key={d}>
            {series.map(s => {
              const v = s.data[di] || 0;
              if (v <= 0) return null;
              const segH = (v / maxY) * innerH;
              const y = cursorY - segH;
              const rect = (
                <rect key={s.key}
                  x={cx - barW / 2} y={y}
                  width={barW} height={segH}
                  fill={s.color}
                  className="an-bar"
                  style={{ animationDelay: `${di * 0.07}s` }} />
              );
              cursorY = y;
              return rect;
            })}
            <text x={cx} y={padT + innerH + 14}
              textAnchor="middle" fill="#8892B0" fontSize={9}>{d}</text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * HourlyHeatmap — 7 rows (days) × 24 cols (hours).
 * data: number[7][24] normalized 0..1 (= fraction of the hour spent focusing).
 * Cells lerp from `gray` (no activity) to `active` (full-hour activity).
 */
function hexToRgb(hex) {
  const x = hex.replace("#", "");
  return [
    parseInt(x.slice(0, 2), 16),
    parseInt(x.slice(2, 4), 16),
    parseInt(x.slice(4, 6), 16),
  ];
}
function blendHex(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

export function HourlyHeatmap({
  data, days, hourLabels = [0, 4, 8, 12, 16, 20, 24],
  gray = "#3D4258", active = "#00C48C",
}) {
  // sized ~160% of the previous compact version
  const cell = 17;
  const gap = 3;
  const leftPad = 36, topPad = 20, rightPad = 14;
  const w = leftPad + 24 * (cell + gap) + rightPad;
  const h = topPad + 7 * (cell + gap);

  const colorFor = (v) => {
    const t = Math.max(0, Math.min(1, v));
    return blendHex(gray, active, t);
  };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {hourLabels.map(hr => {
        const x = leftPad + hr * (cell + gap);
        return <text key={hr} x={x} y={13} textAnchor="middle"
          fill="#8892B0" fontSize={11}>{String(hr).padStart(2, "0")}</text>;
      })}
      {data.map((row, di) => (
        <g key={di}>
          <text x={leftPad - 7} y={topPad + di * (cell + gap) + cell - 4}
            textAnchor="end" fill="#8892B0" fontSize={11}>{days[di]}</text>
          {row.map((v, hi) => (
            <rect key={hi}
              x={leftPad + hi * (cell + gap)}
              y={topPad + di * (cell + gap)}
              width={cell} height={cell} rx={3}
              fill={colorFor(v)}
              className="an-cell"
              style={{ animationDelay: `${(di * 24 + hi) * 0.004}s` }} />
          ))}
        </g>
      ))}
    </svg>
  );
}
