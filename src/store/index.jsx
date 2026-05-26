import { createContext, useContext, useReducer, useEffect } from "react";
import {
  INITIAL_TASKS, INITIAL_SETTINGS, INITIAL_BLOCKED_SITES,
  buildSeedTimerHistory,
} from "../constants/data";

// Bump this whenever data.js seed contents change — forces an in-place
// re-seed on next load so prototype demos stay consistent.
const SEED_VERSION = 2;

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
};

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

  save(KEYS.tasks,        INITIAL_TASKS);
  save(KEYS.blockedSites, INITIAL_BLOCKED_SITES);
  save(KEYS.timerHistory, history);
  save(KEYS.sessions,     sessionsToday);
  save(KEYS.date,         today);
  save(KEYS.seedVersion,  SEED_VERSION);
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
};