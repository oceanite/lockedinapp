// ─────────────────────────────────────────────────────────────
// Prototype seed data — Phase 2 dummy content
// Bump SEED_VERSION in store/index.jsx whenever this file changes
// to force re-seeding for existing users.
// ─────────────────────────────────────────────────────────────

export const INITIAL_TASKS = {
  doNow: [
    { id: 1,  text: "Proyek PPB",                  done: true,  deadline: "2026-05-25" },
    { id: 2,  text: "Makalah KWN",                 done: true,  deadline: "2026-05-24" },
    { id: 3,  text: "Slide presentasi Capstone",   done: false, deadline: "2026-05-28" },
    { id: 4,  text: "Review PR feature/timer",     done: false, deadline: "2026-05-27" },
  ],
  schedule: [
    { id: 5,  text: "Rapiin CV",                   done: true,  deadline: "2026-05-23" },
    { id: 6,  text: "Revisi tugas KBT",            done: true,  deadline: "2026-05-22" },
    { id: 7,  text: "Daftar magang",               done: true,  deadline: "2026-05-21" },
    { id: 8,  text: "Riset bahan thesis",          done: false, deadline: "2026-05-30" },
    { id: 9,  text: "Workshop UI/UX",              done: false, deadline: "2026-06-01" },
  ],
  delegate: [
    { id: 10, text: "Cek balasan email dosen",     done: true,  deadline: "" },
    { id: 11, text: "Update progress ke grup",     done: true,  deadline: "" },
    { id: 12, text: "Approval design mentor",      done: false, deadline: "2026-05-29" },
  ],
  delete: [
    { id: 13, text: "Rapiin playlist spotify",     done: true,  deadline: "" },
    { id: 14, text: "Scroll Twitter feed",         done: true,  deadline: "" },
    { id: 15, text: "Reorganize bookmark folder",  done: false, deadline: "" },
    { id: 16, text: "Catch up gosip kampus",       done: false, deadline: "" },
  ],
};

// kept for backwards-compat references (not used by the new AnalyticsPage)
export const ANALYTICS_DATA = {
  deepWork:     [2, 5, 8, 6, 14, 10, 8.75],
  focusSession: [0, 30, 45, 60, 80, 90, 33],
  distractions: [10, 1, 11, 20, 10, 30, 7],
  days:         ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export const INITIAL_SETTINGS = {
  autoBreaks:    true,
  dnd:           true,
  notifications: true,
  sound:         true,
  breakInterval: "4",
  focusDuration: "25",
  shortBreak:    "5",
  longBreak:     "15",
  theme:         "dark",
  userName:      "Name",
  userEmail:     "name@email.com",
};

export const INITIAL_BLOCKED_SITES = [
  { id: 101, url: "instagram.com", active: true  },
  { id: 102, url: "twitter.com",   active: true  },
  { id: 103, url: "youtube.com",   active: true  },
  { id: 104, url: "tiktok.com",    active: true  },
  { id: 105, url: "reddit.com",    active: false },
];

// Per-weekday completion counts by urgency quadrant. Drives the stacked bar
// chart on Analytics. Index 0 = Mon … 6 = Sun.
export const DAILY_TASK_COMPLETIONS = [
  { doNow: 1, schedule: 3, delegate: 2, delete: 4 }, // Mon
  { doNow: 0, schedule: 2, delegate: 1, delete: 2 }, // Tue
  { doNow: 2, schedule: 1, delegate: 0, delete: 1 }, // Wed
  { doNow: 1, schedule: 2, delegate: 2, delete: 3 }, // Thu
  { doNow: 0, schedule: 1, delegate: 1, delete: 1 }, // Fri
  { doNow: 3, schedule: 2, delegate: 1, delete: 3 }, // Sat
  { doNow: 2, schedule: 3, delegate: 2, delete: 2 }, // Sun
];

// ─────────────────────────────────────────────────────────────
// Timer history seed. Builds entries relative to the date the seed
// runs so the analytics charts always show "current" data without
// shifting on every reload (once seeded, dates are frozen in storage).
//
// Plan: [dayOffsetFromToday, hour24, durationMin, mode]
// Heavier load on weekend days (Sat/Sun) and peak hours 9–11 and 21–23
// to match the prototype's peak-times callout.
// ─────────────────────────────────────────────────────────────

const HISTORY_PLAN = [
  // today
  [0, 9,  30, "custom"],
  [0, 10, 25, "pomodoro"],
  [0, 11, 45, "custom"],
  [0, 14, 60, "custom"],

  // 1 day back
  [1, 9,  25, "pomodoro"],
  [1, 10, 45, "custom"],
  [1, 14, 30, "custom"],

  // 2 days back  — peak day
  [2, 10, 60, "custom"],
  [2, 11, 90, "custom"],
  [2, 15, 45, "custom"],
  [2, 21, 60, "custom"],
  [2, 22, 90, "custom"],
  [2, 23, 60, "custom"],

  // 3 days back — peak day
  [3, 9,  60, "custom"],
  [3, 10, 90, "custom"],
  [3, 11, 60, "custom"],
  [3, 15, 90, "custom"],
  [3, 21, 90, "custom"],
  [3, 22, 60, "custom"],
  [3, 23, 45, "custom"],

  // 4 days back
  [4, 9,  30, "custom"],
  [4, 10, 25, "pomodoro"],
  [4, 16, 60, "custom"],
  [4, 22, 45, "custom"],

  // 5 days back
  [5, 9,  45, "custom"],
  [5, 10, 25, "pomodoro"],
  [5, 11, 30, "custom"],
  [5, 14, 60, "custom"],
  [5, 22, 45, "custom"],

  // 6 days back
  [6, 9,  25, "pomodoro"],
  [6, 10, 30, "custom"],
  [6, 15, 60, "custom"],
  [6, 22, 90, "custom"],
];

export function buildSeedTimerHistory() {
  const now = new Date();
  return HISTORY_PLAN.map(([dayOffset, hour, durMin, mode], i) => {
    const start = new Date(now);
    start.setDate(start.getDate() - dayOffset);
    start.setHours(hour, (i * 7) % 60, 0, 0);
    const completedAt = new Date(start.getTime() + durMin * 60 * 1000);
    return {
      id: 200000 + i,
      mode,
      label: mode === "pomodoro" ? "Pomodoro" : `Custom · ${durMin}m`,
      durationSecs: durMin * 60,
      completedAt: completedAt.toISOString(),
      status: "completed",
    };
  });
}
