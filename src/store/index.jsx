import { createContext, useContext, useReducer } from "react";
import { INITIAL_TASKS, INITIAL_SETTINGS } from "../constants/data";

const initialState = {
  page:     "dashboard",
  tasks:    INITIAL_TASKS,
  settings: INITIAL_SETTINGS,
  sessions: 0,
};

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

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
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

// Action creators
export const actions = {
  setPage:          (page)              => ({ type: "SET_PAGE",           payload: page }),
  addTask:          (quadrant, task)    => ({ type: "ADD_TASK",           payload: { quadrant, task } }),
  toggleTask:       (quadrant, id)      => ({ type: "TOGGLE_TASK",        payload: { quadrant, id } }),
  removeTask:       (quadrant, id)      => ({ type: "REMOVE_TASK",        payload: { quadrant, id } }),
  incrementSessions:()                  => ({ type: "INCREMENT_SESSIONS"  }),
  updateSetting:    (key, value)        => ({ type: "UPDATE_SETTING",     payload: { key, value } }),
};
