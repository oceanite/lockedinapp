import { useState, useEffect, useRef, useCallback } from "react";
import { TIMER_PRESETS } from "../constants/theme";

export function useTimer({ onComplete, presets = TIMER_PRESETS } = {}) {
  const [mode, setMode]       = useState("pomodoro");
  const [seconds, setSeconds] = useState(presets.pomodoro);
  const [running, setRunning] = useState(false);
  const [customMin, setCustomMin] = useState(30);
  const intervalRef = useRef(null);

  // Guards the completion callback so it fires exactly once per run, even
  // under React StrictMode (which double-invokes updaters/effects in dev).
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // seconds for a given mode, honoring the (settings-driven) presets
  const presetSecs = useCallback(
    (m) => (m === "custom" ? customMin * 60 : presets[m]),
    [customMin, presets]
  );
  const totalSecs = presetSecs(mode);

  const reset = useCallback(() => {
    completedRef.current = false;
    setRunning(false);
    setSeconds(presetSecs(mode));
  }, [mode, presetSecs]);

  const switchMode = useCallback((m) => {
    completedRef.current = false;
    setMode(m);
    setRunning(false);
    setSeconds(presetSecs(m));
  }, [presetSecs]);

  const setCustomDuration = useCallback((min) => {
    setCustomMin(min);
    if (mode === "custom") {
      completedRef.current = false;
      setSeconds(min * 60);
    }
  }, [mode]);

  // Quick-pick: jumps straight into custom mode with the supplied minutes.
  const applyQuickPick = useCallback((min) => {
    completedRef.current = false;
    setMode("custom");
    setCustomMin(min);
    setSeconds(min * 60);
    setRunning(false);
  }, []);

  // Keep the displayed time in sync when the active preset changes (e.g. the
  // user edits Focus/Break durations in Settings) — only while idle.
  useEffect(() => {
    if (!running) {
      completedRef.current = false;
      setSeconds(totalSecs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSecs]);

  // Tick — the updater is PURE so StrictMode double-invocation is harmless.
  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds(s => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Fire completion exactly once when the countdown reaches 0 while running.
  useEffect(() => {
    if (running && seconds === 0 && !completedRef.current) {
      completedRef.current = true;
      setRunning(false);
      onCompleteRef.current?.();
    }
  }, [running, seconds]);

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
