import { useState, useEffect, useRef, useCallback } from "react";
import { TIMER_PRESETS } from "../constants/theme";

export function useTimer({ onComplete } = {}) {
  const [mode, setMode]       = useState("pomodoro");
  const [seconds, setSeconds] = useState(TIMER_PRESETS.pomodoro);
  const [running, setRunning] = useState(false);
  const [customMin, setCustomMin] = useState(30);
  const intervalRef = useRef(null);

  const totalSecs = mode === "custom" ? customMin * 60 : TIMER_PRESETS[mode];

  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(mode === "custom" ? customMin * 60 : TIMER_PRESETS[mode]);
  }, [mode, customMin]);

  const switchMode = useCallback((m) => {
    setMode(m);
    setRunning(false);
    setSeconds(m === "custom" ? customMin * 60 : TIMER_PRESETS[m]);
  }, [customMin]);

  const setCustomDuration = useCallback((min) => {
    setCustomMin(min);
    if (mode === "custom") setSeconds(min * 60);
  }, [mode]);

  // Quick-pick: jumps straight into custom mode with the supplied minutes.
  const applyQuickPick = useCallback((min) => {
    setMode("custom");
    setCustomMin(min);
    setSeconds(min * 60);
    setRunning(false);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            onComplete?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, onComplete]);

  const progress = ((totalSecs - seconds) / totalSecs) * 100;
  const display = {
    mins: String(Math.floor(seconds / 60)).padStart(2, "0"),
    secs: String(seconds % 60).padStart(2, "0"),
  };

  return {
    mode, seconds, running, customMin, totalSecs, progress, display,
    setRunning, switchMode, reset, setCustomDuration, applyQuickPick,
  };
}
