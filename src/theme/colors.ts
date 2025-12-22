// src/theme/colors.ts
export type ThemeMode = "light" | "dark";

export type ColorPalette = {
  bg: string;
  bgSoft: string;
  bgElevated: string;
  primary: string;
  primarySoft: string;
  accent: string;
  text: string;
  textMuted: string;
  muted: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  header: string;
  statusBar: string;
};

export const lightColors: ColorPalette = {
  bg: "#F5F3FF", // page background (soft violet)
  bgSoft: "#EEF2FF", // sections, soft cards
  bgElevated: "#FFFFFF", // cards, modals
  primary: "#6366F1", // main violet (matches logo/splash vibe)
  primarySoft: "rgba(99,102,241,0.12)",
  accent: "#8B5CF6",
  text: "#0F172A",
  textMuted: "#6B7280",
  muted: "#6B7280",
  border: "#E5E7EB",
  danger: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  header: "#0F172A", // header/emphasized text
  statusBar: "#F5F3FF", // status bar background
};

export const darkColors: ColorPalette = {
  bg: "#020617",
  bgSoft: "#0F172A",
  bgElevated: "#020617",
  primary: "#818CF8",
  primarySoft: "rgba(129,140,248,0.16)",
  accent: "#A855F7",
  text: "#F9FAFB",
  textMuted: "#9CA3AF",
  muted: "#9CA3AF",
  border: "#1F2937",
  danger: "#F97373",
  success: "#34D399",
  warning: "#FBBF24",
  header: "#F9FAFB", // header/emphasized text
  statusBar: "#020617", // status bar background
};

export let colors: ColorPalette = lightColors;
let currentMode: ThemeMode = "light";

export const setThemeMode = (mode: ThemeMode) => {
  currentMode = mode;
  colors = mode === "dark" ? darkColors : lightColors;
};

export const getThemeMode = () => currentMode;
