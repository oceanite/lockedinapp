export const COLORS = {
  bg:        "#0D0F1E",
  sidebar:   "#080A14",
  card:      "#1A1E3A",
  border:    "#1E2340",
  blue:      "#3B5BFF",
  blueMid:   "#2A46E8",
  accent:    "#00E5FF",
  green:     "#00C48C",
  orange:    "#FF9500",
  red:       "#FF4D4D",
  purple:    "#9B59FF",
  yellow:    "#FFD60A",
  text:      "#FFFFFF",
  textSec:   "#8892B0",
  textMuted: "#4A5578",
};

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
