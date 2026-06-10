import { createContext, useContext, useReducer, useEffect } from "react";
import {
  INITIAL_TASKS, INITIAL_SETTINGS, INITIAL_BLOCKED_SITES,
  buildSeedTimerHistory,
} from "../constants/data";

// Bump this whenever data.js seed contents change — forces an in-place
// re-seed on next load so prototype demos stay consistent.
const SEED_VERSION = 3;

// Built-in account for quick testing (username/email "admin", password "admin").
const ADMIN_USER = { name: "Admin", email: "admin", password: "admin" };
const DEFAULT_POINTS = 200; // starting balance for trials

// ─────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────
const KEYS = {
  tasks:        "lockedin:tasks",
  settings:     "lockedin:settings",
  sessions:     "lockedin:sessions",
  date:         "lockedin:date",       // untuk reset sesi harian
  page:         "lockedin:page",
  blockedSites: "lockedin:blockedSites",
  timerHistory: "lockedin:timerHistory",
  musicState:   "lockedin:musicState",
  seedVersion:  "lockedin:seedVersion",
  auth:         "lockedin:auth",          // { currentUser, users }
  points:       "lockedin:points",
  unlockedThemes: "lockedin:unlockedThemes",
  energy:       "lockedin:energy",        // { level, ts }
};

// Energy model: recovers during regular time, drains during focus sessions.
const ENERGY_RECOVER_PER_MIN = 10 / 15; // +10% every 15 min idle
const ENERGY_DRAIN_PER_MIN   = 1 / 2;   // −1%  every 2 min focused

/** Bank recovery accrued since the last checkpoint (capped at 100). */
function settleEnergy(energy) {
  const now = Date.now();
  const elapsedMin = Math.max(0, (now - energy.ts) / 60000);
  const level = Math.min(100, energy.level + elapsedMin * ENERGY_RECOVER_PER_MIN);
  return { level, ts: now };
}

/** Live energy level for display = stored level + recovery since checkpoint. */
export function liveEnergyLevel(energy) {
  if (!energy) return 100;
  return Math.round(settleEnergy(energy).level);
}

export function energyLabel(level) {
  if (level < 34) return "Low";
  if (level < 67) return "Mid";
  return "High";
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage penuh atau mode private — gagal dengan diam-diam
  }
}

/** Format tanggal hari ini sebagai string "YYYY-MM-DD" */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Jika tanggal tersimpan bukan hari ini, reset sessions ke 0 */
function resolveSessionsForToday() {
  const savedDate = load(KEYS.date, null);
  const today = todayStr();
  if (savedDate !== today) {
    save(KEYS.date, today);
    save(KEYS.sessions, 0);
    return 0;
  }
  return load(KEYS.sessions, 0);
}

/**
 * One-shot dummy seed for prototyping. Runs whenever the stored
 * SEED_VERSION is behind the current code's. Overwrites the seeded
 * keys in-place so the analytics page always has data to render.
 */
function runSeedIfNeeded() {
  const storedVersion = load(KEYS.seedVersion, 0);
  if (storedVersion >= SEED_VERSION) return;

  const history = buildSeedTimerHistory();
  const today = todayStr();
  const sessionsToday = history.filter(h =>
    h.completedAt.slice(0, 10) === today
  ).length;

  save(KEYS.tasks,          INITIAL_TASKS);
  save(KEYS.blockedSites,   INITIAL_BLOCKED_SITES);
  save(KEYS.timerHistory,   history);
  save(KEYS.sessions,       sessionsToday);
  save(KEYS.date,           today);
  save(KEYS.points,         DEFAULT_POINTS);
  save(KEYS.unlockedThemes, ["dark"]);
  save(KEYS.seedVersion,    SEED_VERSION);
}

/** Ensure the built-in admin account always exists. */
function ensureAdmin(auth) {
  const exists = auth.users.some(u => (u.email || "").toLowerCase() === ADMIN_USER.email);
  if (exists) return auth;
  return { ...auth, users: [...auth.users, ADMIN_USER] };
}

// ─────────────────────────────────────────────────────────────
// INITIAL STATE — hydrate dari localStorage saat pertama load
// ─────────────────────────────────────────────────────────────

function buildInitialState() {
  runSeedIfNeeded();
  return {
    page:         load(KEYS.page, "dashboard"),
    tasks:        load(KEYS.tasks, INITIAL_TASKS),
    settings:     load(KEYS.settings, INITIAL_SETTINGS),
    sessions:     resolveSessionsForToday(),
    blockedSites: load(KEYS.blockedSites, INITIAL_BLOCKED_SITES),
    timerHistory: load(KEYS.timerHistory, buildSeedTimerHistory()),
    musicState:   load(KEYS.musicState, {
      selectedId: null,
      volume:     0.6,
      loop:       true,
    }),
    // auth: prototype-only, stored in localStorage (no real backend/hashing)
    auth:           ensureAdmin(load(KEYS.auth, { currentUser: null, users: [] })),
    points:         load(KEYS.points, DEFAULT_POINTS),
    unlockedThemes: load(KEYS.unlockedThemes, ["dark"]),
    energy:         load(KEYS.energy, { level: 75, ts: Date.now() }),
  };
}

// ─────────────────────────────────────────────────────────────
// REDUCER — logika bisnis tidak berubah
// ─────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };

    case "ADD_TASK": {
      const { quadrant, task } = action.payload;
      return {
        ...state,
        tasks: { ...state.tasks, [quadrant]: [...state.tasks[quadrant], task] },
      };
    }

    case "TOGGLE_TASK": {
      const { quadrant, id } = action.payload;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [quadrant]: state.tasks[quadrant].map(t =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        },
      };
    }

    case "REMOVE_TASK": {
      const { quadrant, id } = action.payload;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [quadrant]: state.tasks[quadrant].filter(t => t.id !== id),
        },
      };
    }

    case "INCREMENT_SESSIONS":
      return { ...state, sessions: state.sessions + 1 };

    case "UPDATE_SETTING": {
      const { key, value } = action.payload;
      return {
        ...state,
        settings: { ...state.settings, [key]: value },
      };
    }

    case "ADD_BLOCKED_SITE": {
      const site = action.payload;
      if (state.blockedSites.some(s => s.url === site.url)) return state;
      return { ...state, blockedSites: [...state.blockedSites, site] };
    }

    case "REMOVE_BLOCKED_SITE":
      return {
        ...state,
        blockedSites: state.blockedSites.filter(s => s.id !== action.payload),
      };

    case "TOGGLE_BLOCKED_SITE":
      return {
        ...state,
        blockedSites: state.blockedSites.map(s =>
          s.id === action.payload ? { ...s, active: !s.active } : s
        ),
      };

    case "ADD_TIMER_HISTORY":
      return {
        ...state,
        timerHistory: [action.payload, ...state.timerHistory].slice(0, 50),
      };

    case "CLEAR_TIMER_HISTORY":
      return { ...state, timerHistory: [] };

    case "UPDATE_MUSIC_STATE":
      return {
        ...state,
        musicState: { ...state.musicState, ...action.payload },
      };

    // ── Auth ──────────────────────────────────────────────────
    case "REGISTER": {
      const { name, email, password } = action.payload;
      const user = { name, email, password };
      return {
        ...state,
        auth: {
          currentUser: { name, email },
          users: [...state.auth.users, user],
        },
        settings: { ...state.settings, userName: name, userEmail: email },
      };
    }

    case "LOGIN": {
      const { name, email } = action.payload; // validated in component
      return {
        ...state,
        auth: { ...state.auth, currentUser: { name, email } },
        settings: { ...state.settings, userName: name, userEmail: email },
      };
    }

    case "LOGOUT":
      return { ...state, auth: { ...state.auth, currentUser: null } };

    // ── Points & theme unlocks ────────────────────────────────
    case "ADD_POINTS":
      return { ...state, points: state.points + action.payload };

    case "UNLOCK_THEME": {
      const { theme, cost } = action.payload;
      if (state.unlockedThemes.includes(theme)) return state;
      if (state.points < cost) return state;
      return {
        ...state,
        points: state.points - cost,
        unlockedThemes: [...state.unlockedThemes, theme],
      };
    }

    // ── Energy ────────────────────────────────────────────────
    // Checkpoint accrued recovery (call when a focus session starts).
    case "SETTLE_ENERGY":
      return { ...state, energy: settleEnergy(state.energy) };

    // Drain after a completed focus session (no recovery for that period).
    case "DRAIN_ENERGY": {
      const minutes = action.payload;
      const level = Math.max(0, state.energy.level - minutes * ENERGY_DRAIN_PER_MIN);
      return { ...state, energy: { level, ts: Date.now() } };
    }

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────
// CONTEXT + PROVIDER
// ─────────────────────────────────────────────────────────────

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  // Setiap kali state berubah, sync yang relevan ke localStorage
  useEffect(() => { save(KEYS.tasks,        state.tasks);        }, [state.tasks]);
  useEffect(() => { save(KEYS.settings,     state.settings);     }, [state.settings]);
  useEffect(() => { save(KEYS.sessions,     state.sessions);     }, [state.sessions]);
  useEffect(() => { save(KEYS.page,         state.page);         }, [state.page]);
  useEffect(() => { save(KEYS.blockedSites, state.blockedSites); }, [state.blockedSites]);
  useEffect(() => { save(KEYS.timerHistory, state.timerHistory); }, [state.timerHistory]);
  useEffect(() => { save(KEYS.musicState,   state.musicState);   }, [state.musicState]);
  useEffect(() => { save(KEYS.auth,           state.auth);           }, [state.auth]);
  useEffect(() => { save(KEYS.points,         state.points);         }, [state.points]);
  useEffect(() => { save(KEYS.unlockedThemes, state.unlockedThemes); }, [state.unlockedThemes]);
  useEffect(() => { save(KEYS.energy,         state.energy);         }, [state.energy]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

// ─────────────────────────────────────────────────────────────
// ACTION CREATORS — tidak berubah
// ─────────────────────────────────────────────────────────────

export const actions = {
  setPage:             (page)           => ({ type: "SET_PAGE",             payload: page }),
  addTask:             (quadrant, task) => ({ type: "ADD_TASK",             payload: { quadrant, task } }),
  toggleTask:          (quadrant, id)   => ({ type: "TOGGLE_TASK",          payload: { quadrant, id } }),
  removeTask:          (quadrant, id)   => ({ type: "REMOVE_TASK",          payload: { quadrant, id } }),
  incrementSessions:   ()               => ({ type: "INCREMENT_SESSIONS"    }),
  updateSetting:       (key, value)     => ({ type: "UPDATE_SETTING",       payload: { key, value } }),
  addBlockedSite:      (site)           => ({ type: "ADD_BLOCKED_SITE",     payload: site }),
  removeBlockedSite:   (id)             => ({ type: "REMOVE_BLOCKED_SITE",  payload: id }),
  toggleBlockedSite:   (id)             => ({ type: "TOGGLE_BLOCKED_SITE",  payload: id }),
  addTimerHistory:     (entry)          => ({ type: "ADD_TIMER_HISTORY",    payload: entry }),
  clearTimerHistory:   ()               => ({ type: "CLEAR_TIMER_HISTORY"   }),
  updateMusicState:    (patch)          => ({ type: "UPDATE_MUSIC_STATE",   payload: patch }),
  register:            (user)           => ({ type: "REGISTER",             payload: user }),
  login:               (user)           => ({ type: "LOGIN",                payload: user }),
  logout:              ()               => ({ type: "LOGOUT"                 }),
  addPoints:           (amount)         => ({ type: "ADD_POINTS",            payload: amount }),
  unlockTheme:         (theme, cost)    => ({ type: "UNLOCK_THEME",          payload: { theme, cost } }),
  settleEnergy:        ()               => ({ type: "SETTLE_ENERGY"           }),
  drainEnergy:         (minutes)        => ({ type: "DRAIN_ENERGY",           payload: minutes }),
};