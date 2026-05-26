import { createContext, useContext, useReducer, useEffect } from "react";
import { INITIAL_TASKS, INITIAL_SETTINGS } from "../constants/data";

// ─────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────
const KEYS = {
  tasks:    "lockedin:tasks",
  settings: "lockedin:settings",
  sessions: "lockedin:sessions",
  date:     "lockedin:date",       // untuk reset sesi harian
  page:     "lockedin:page",
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

// ─────────────────────────────────────────────────────────────
// INITIAL STATE — hydrate dari localStorage saat pertama load
// ─────────────────────────────────────────────────────────────

function buildInitialState() {
  return {
    page:     load(KEYS.page, "dashboard"),
    tasks:    load(KEYS.tasks, INITIAL_TASKS),
    settings: load(KEYS.settings, INITIAL_SETTINGS),
    sessions: resolveSessionsForToday(),
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
  useEffect(() => { save(KEYS.tasks,    state.tasks);    }, [state.tasks]);
  useEffect(() => { save(KEYS.settings, state.settings); }, [state.settings]);
  useEffect(() => { save(KEYS.sessions, state.sessions); }, [state.sessions]);
  useEffect(() => { save(KEYS.page,     state.page);     }, [state.page]);

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
  setPage:           (page)           => ({ type: "SET_PAGE",           payload: page }),
  addTask:           (quadrant, task) => ({ type: "ADD_TASK",           payload: { quadrant, task } }),
  toggleTask:        (quadrant, id)   => ({ type: "TOGGLE_TASK",        payload: { quadrant, id } }),
  removeTask:        (quadrant, id)   => ({ type: "REMOVE_TASK",        payload: { quadrant, id } }),
  incrementSessions: ()               => ({ type: "INCREMENT_SESSIONS"  }),
  updateSetting:     (key, value)     => ({ type: "UPDATE_SETTING",     payload: { key, value } }),
};