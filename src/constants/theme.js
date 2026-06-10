// ─────────────────────────────────────────────────────────────
// Theme palettes.
//
// `COLORS` is a LIVE object imported by reference across the app.
// `applyTheme(name)` mutates it in place (Object.assign) so every
// component that reads COLORS.* on its next render picks up the new
// palette — no prop drilling or context needed.
//
// Each theme only overrides the "surface" + brand hues; the semantic
// status colors (green/orange/red/yellow) stay consistent so charts
// and quadrants read the same across themes.
// ─────────────────────────────────────────────────────────────

// status hues shared across every theme (semantic consistency)
const STATUS = {
  green:  "#00C48C",
  orange: "#FF9500",
  red:    "#FF4D4D",
  yellow: "#FFD60A",
};

// ── Dark themes ──────────────────────────────────────────────
const DARK = {
  bg:        "#0D0F1E",
  sidebar:   "#080A14",
  card:      "#1A1E3A",
  border:    "#1E2340",
  blue:      "#3B5BFF",
  blueMid:   "#2A46E8",
  accent:    "#00E5FF",
  purple:    "#9B59FF",
  text:      "#FFFFFF",
  textSec:   "#8892B0",
  textMuted: "#4A5578",
  heatEmpty: "#3D4258",
  ...STATUS,
};

const MIDNIGHT = {
  bg:        "#0B0A1F",
  sidebar:   "#070617",
  card:      "#1A1733",
  border:    "#2C2752",
  blue:      "#6C5CE7",
  blueMid:   "#5346C4",
  accent:    "#A29BFE",
  purple:    "#B98CFF",
  text:      "#FFFFFF",
  textSec:   "#9A93C4",
  textMuted: "#5B5488",
  heatEmpty: "#332C52",
  ...STATUS,
};

const OCEAN = {
  bg:        "#07131C",
  sidebar:   "#040D14",
  card:      "#0E2433",
  border:    "#1B3B4D",
  blue:      "#2E8BC0",
  blueMid:   "#246F9A",
  accent:    "#2EE6D6",
  purple:    "#5BC8FF",
  text:      "#FFFFFF",
  textSec:   "#8BA9B8",
  textMuted: "#476273",
  heatEmpty: "#1E4154",
  ...STATUS,
};

// ── Light themes ─────────────────────────────────────────────
const DAYLIGHT = {
  bg:        "#F2F5FB",
  sidebar:   "#FFFFFF",
  card:      "#FFFFFF",
  border:    "#DCE3EF",
  blue:      "#2F4FE0",
  blueMid:   "#2A46E8",
  accent:    "#0379A6",
  purple:    "#6D28D9",
  text:      "#141A2E",
  textSec:   "#4A5775",
  textMuted: "#7785A1",
  heatEmpty: "#E5EAF3",
  ...STATUS,
};

const SAND = {
  bg:        "#F7F2E9",
  sidebar:   "#FFFDF8",
  card:      "#FFFDF8",
  border:    "#E6DAC2",
  blue:      "#C2620A",   // warm amber primary
  blueMid:   "#9A4E08",
  accent:    "#0E7490",
  purple:    "#8A4D0B",
  text:      "#26221A",
  textSec:   "#5C5142",
  textMuted: "#8C7E66",
  heatEmpty: "#ECE3D3",
  ...STATUS,
};

const ROSE = {
  bg:        "#FBF3F8",
  sidebar:   "#FFFAFD",
  card:      "#FFFAFD",
  border:    "#EFD8E8",
  blue:      "#C81E6B",   // pink primary
  blueMid:   "#A3155A",
  accent:    "#6D28D9",
  purple:    "#7E22CE",
  text:      "#241624",
  textSec:   "#5E4A5A",
  textMuted: "#8A718A",
  heatEmpty: "#F2E3EE",
  ...STATUS,
};

export const THEMES = {
  dark: DARK, midnight: MIDNIGHT, ocean: OCEAN,
  daylight: DAYLIGHT, sand: SAND, rose: ROSE,
};

// Theme catalog for the redeem-with-points store in Settings.
// `dark` is free & owned by default; the rest cost points earned from sessions.
export const THEME_META = [
  { id: "dark",     label: "Dark",     emoji: "🌑", mode: "Dark",  cost: 0   },
  { id: "midnight", label: "Midnight", emoji: "🌌", mode: "Dark",  cost: 50  },
  { id: "ocean",    label: "Ocean",    emoji: "🌊", mode: "Dark",  cost: 80  },
  { id: "daylight", label: "Daylight", emoji: "☀️", mode: "Light", cost: 120 },
  { id: "sand",     label: "Sand",     emoji: "🏜️", mode: "Light", cost: 150 },
  { id: "rose",     label: "Rose",     emoji: "🌸", mode: "Light", cost: 200 },
];

// Live palette (starts as dark; mutated by applyTheme).
export const COLORS = { ...DARK };

/** Swap the active palette in place and sync the document background. */
export function applyTheme(name) {
  const palette = THEMES[name] || DARK;
  Object.assign(COLORS, palette);
  if (typeof document !== "undefined") {
    document.body.style.background = palette.bg;
  }
  return COLORS;
}

export const QUADRANTS = [
  { key: "doNow",    label: "Do Now",    desc: "Urgent & Important",         color: "#FF4D4D" },
  { key: "schedule", label: "Schedule",  desc: "Not Urgent & Important",     color: "#FF9500" },
  { key: "delegate", label: "Delegate",  desc: "Urgent & Not Important",     color: "#00C48C" },
  { key: "delete",   label: "Delete",    desc: "Not Urgent & Not Important",  color: "#4A5578" },
];

export const NAV_ITEMS = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "task",      icon: "✓", label: "Task"       },
  { id: "focus",     icon: "◎", label: "Focus Room" },
  { id: "analytics", icon: "▦", label: "Analytics"  },
  { id: "settings",  icon: "⚙", label: "Settings"   },
];

export const TIMER_PRESETS = {
  pomodoro: 25 * 60,
  short:     5 * 60,
  long:     15 * 60,
  custom:   30 * 60,
};

// Quick-pick presets shown as shortcut buttons (in minutes)
export const QUICK_PICKS = [30, 60, 90, 120];

// Built-in music tracks (preset vibes shown in the prototype)
export const MUSIC_PRESETS = [
  { id: "deadline",   label: "Deadline Panic",  icon: "💡", color: "#FF4D4D" },
  { id: "brainstorm", label: "Deep Brainstorm", icon: "🧠", color: "#9B59FF" },
  { id: "chill",      label: "Chill Study",     icon: "💻", color: "#00C48C" },
  { id: "zen",        label: "Zen Mode",        icon: "🌸", color: "#00E5FF" },
];
