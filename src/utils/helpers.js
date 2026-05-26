export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short",
  });
}

export function todayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function generateHeatmap() {
  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hr) => {
      if (hr >= 9 && hr <= 11) return 0.9;
      if (hr >= 22 || hr <= 2) return 0.8;
      if (hr >= 8 && hr <= 17) return Math.random() * 0.5 + 0.1;
      return Math.random() * 0.2;
    })
  );
}
