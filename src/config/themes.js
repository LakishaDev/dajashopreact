// Svaka tema ima: primary, accent, bg, surface, text, muted
export const themes = {
  luxGold: {
    name: "luxGold",
    primary: "#C8A94E", // zlatna
    accent: "#1F2937", // duboka antracit
    bg: "#0B0E12", // skoro crna
    surface: "#151923", // tamna površina
    text: "#F5F6F7", // skoro belo
    muted: "#8B8F98", // siva
  },
  midnightBlue: {
    name: "midnightBlue",
    primary: "#4F46E5",
    accent: "#0B1020",
    bg: "#0A0C14",
    surface: "#12172A",
    text: "#F1F5F9",
    muted: "#94A3B8",
  },
  emerald: {
    name: "emerald",
    primary: "#10B981",
    accent: "#0C1A12",
    bg: "#0A0F0D",
    surface: "#10231B",
    text: "#ECFDF5",
    muted: "#86EFAC",
  },
  crimson: {
    name: "crimson",
    primary: "#EF4444",
    accent: "#1B0B0B",
    bg: "#0F0A0A",
    surface: "#1E1515",
    text: "#FEF2F2",
    muted: "#FCA5A5",
  },
  royalViolet: {
    name: "royalViolet",
    primary: "#8B5CF6",
    accent: "#1B1026",
    bg: "#0F0B16",
    surface: "#1A1030",
    text: "#F4F3FF",
    muted: "#C4B5FD",
  },
};

export function applyTheme(theme) {
  const t = typeof theme === "string" ? themes[theme] : theme;
  if (!t) return;
  const r = document.documentElement.style;
  r.setProperty("--color-primary", t.primary);
  r.setProperty("--color-accent", t.accent);
  r.setProperty("--color-bg", t.bg);
  r.setProperty("--color-surface", t.surface);
  r.setProperty("--color-text", t.text);
  r.setProperty("--color-muted", t.muted);
}
