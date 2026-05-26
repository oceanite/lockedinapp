export const INITIAL_TASKS = {
  doNow: [
    { id: 1, text: "Proyek PPB",   done: false, deadline: "2024-01-20" },
    { id: 2, text: "Makalah KWN",  done: false, deadline: "2024-01-19" },
  ],
  schedule: [
    { id: 3, text: "Rapiin CV",         done: false, deadline: "2024-01-25" },
    { id: 4, text: "Revisi tugas KBT",  done: false, deadline: "2024-01-26" },
    { id: 5, text: "Daftar magang",     done: false, deadline: "2024-01-28" },
  ],
  delegate: [],
  delete: [
    { id: 6, text: "Rapiin playlist spotify", done: false, deadline: "" },
  ],
};

export const ANALYTICS_DATA = {
  deepWork:       [2, 5, 8, 6, 14, 10, 8.75],
  focusSession:   [0, 30, 45, 60, 80, 90, 33],
  distractions:   [10, 1, 11, 20, 10, 30, 7],
  days:           ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
