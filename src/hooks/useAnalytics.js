import { useMemo } from "react";
import { useStore } from "../store/index";
import { DAILY_TASK_COMPLETIONS } from "../constants/data";
import { COLORS } from "../constants/theme";

export const DAYS      = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Stack order bottom→top: delete → delegate → schedule → doNow
export const QUADRANT_STACK = [
  { key: "delete",   label: "Delete",   color: COLORS.textMuted },
  { key: "delegate", label: "Delegate", color: COLORS.green     },
  { key: "schedule", label: "Schedule", color: COLORS.orange    },
  { key: "doNow",    label: "Do Now",   color: COLORS.red       },
];

export function formatHM(totalSecs) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.round((totalSecs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// 24-hour format
export function fmtHour(h) {
  return `${String(h % 24).padStart(2, "0")}:00`;
}

// returns top-N busy contiguous ranges (above threshold)
function topClusters(arr, n) {
  if (arr.every(v => v === 0)) return [];
  const max = Math.max(...arr);
  const threshold = max * 0.55;
  const ranges = [];
  let start = null;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= threshold) {
      if (start === null) start = i;
    } else if (start !== null) {
      ranges.push({ from: start, to: i });
      start = null;
    }
  }
  if (start !== null) ranges.push({ from: start, to: arr.length });
  return ranges
    .map(r => ({ ...r, sum: sumRange(arr, r) }))
    .sort((a, b) => b.sum - a.sum)
    .slice(0, n);
}
function sumRange(arr, r) {
  let s = 0;
  for (let i = r.from; i < r.to; i++) s += arr[i];
  return s;
}

export function useAnalytics() {
  const { state } = useStore();
  return useMemo(() => {
    const dayIdx = (iso) => (new Date(iso).getDay() + 6) % 7; // Mon=0..Sun=6
    const completed = state.timerHistory.filter(h => h.status === "completed");

    // per-day deep work
    const deepWorkSecsByDay = Array(7).fill(0);
    const sessionsByDay     = Array(7).fill(0);
    completed.forEach(h => {
      const i = dayIdx(h.completedAt);
      deepWorkSecsByDay[i] += h.durationSecs;
      sessionsByDay[i]     += 1;
    });

    const deepWorkByDay = deepWorkSecsByDay.map(s => +(s / 3600).toFixed(2));
    const totalDeepWorkSecs = deepWorkSecsByDay.reduce((a, b) => a + b, 0);

    const totalSessions = sessionsByDay.reduce((a, b) => a + b, 0);
    const avgFocusMin = totalSessions > 0
      ? Math.round(totalDeepWorkSecs / 60 / totalSessions)
      : 0;
    const avgFocusByDay = sessionsByDay.map((s, i) =>
      s > 0 ? Math.round(deepWorkSecsByDay[i] / 60 / s) : 0
    );

    const activeBlocked = state.blockedSites.filter(s => s.active).length;
    const distractionsByDay = sessionsByDay.map(s => s * activeBlocked);
    const distractionAttempts = distractionsByDay.reduce((a, b) => a + b, 0);

    const allTasks       = Object.values(state.tasks).flat();
    const totalTasks     = allTasks.length;
    const totalDoneTasks = allTasks.filter(t => t.done).length;
    const completionRate = totalTasks > 0 ? totalDoneTasks / totalTasks : 0;

    const dailyByQuadrant = QUADRANT_STACK.map(q => ({
      key: q.key, label: q.label, color: q.color,
      data: DAILY_TASK_COMPLETIONS.map(d => d[q.key] || 0),
    }));
    const totalDoneWeek = dailyByQuadrant.reduce(
      (sum, s) => sum + s.data.reduce((a, b) => a + b, 0), 0
    );

    // heatmap by minutes per hour cell, capped at 60
    const heatMin = Array.from({ length: 7 }, () => Array(24).fill(0));
    completed.forEach(h => {
      const end = new Date(h.completedAt);
      const start = new Date(end.getTime() - h.durationSecs * 1000);
      let cursor = new Date(start);
      cursor.setMinutes(0, 0, 0);
      while (cursor < end) {
        const next = new Date(cursor);
        next.setHours(cursor.getHours() + 1);
        const oStart = start > cursor ? start : cursor;
        const oEnd   = end   < next   ? end   : next;
        const mins = (oEnd - oStart) / 60000;
        if (mins > 0) {
          const d = (cursor.getDay() + 6) % 7;
          const hr = cursor.getHours();
          heatMin[d][hr] += mins;
        }
        cursor = next;
      }
    });
    const heatmap = heatMin.map(row => row.map(m => Math.min(m, 60) / 60));

    const hourSums = Array(24).fill(0);
    heatMin.forEach(row => row.forEach((m, h) => { hourSums[h] += m; }));
    const peakHours = topClusters(hourSums, 2);

    const daySums = heatMin.map(row => row.reduce((a, b) => a + b, 0));
    const peakDays = daySums
      .map((v, i) => ({ name: DAYS_FULL[i], v }))
      .filter(x => x.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 2)
      .map(x => x.name);

    const topRange = peakHours[0];
    const peakHourLabel = topRange
      ? `${fmtHour(topRange.from)}–${fmtHour(topRange.to)}`
      : "—";

    return {
      totalDeepWorkLabel: formatHM(totalDeepWorkSecs),
      deepWorkByDay,
      avgFocusMin,
      avgFocusByDay,
      distractionAttempts,
      distractionsByDay,
      completionRate,
      totalDoneTasks,
      totalDoneWeek,
      dailyByQuadrant,
      heatmap,
      peakHours,
      peakDays,
      peakHourLabel,
    };
  }, [state.timerHistory, state.tasks, state.blockedSites]);
}
