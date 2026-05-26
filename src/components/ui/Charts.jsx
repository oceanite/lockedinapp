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
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`${color}33`} strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${value * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

export function EnergyGauge({ value = 68 }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const prog = (value / 100) * circ;
  return (
    <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={50} cy={50} r={radius} fill="none"
        stroke="#3B5BFF33" strokeWidth={8} />
      <circle cx={50} cy={50} r={radius} fill="none"
        stroke="#3B5BFF" strokeWidth={8}
        strokeDasharray={`${prog} ${circ}`} strokeLinecap="round" />
      <text x={50} y={55} textAnchor="middle" fill="#fff" fontSize={16}
        fontWeight={700} style={{ transform: "rotate(90deg) translate(0,-100px)" }}>
        {value}
      </text>
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
