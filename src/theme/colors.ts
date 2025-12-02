export type ThemeMode = 'light' | 'dark';

const lightColors = {
  // Light yellowish Blinkit-like theme
  bg: '#FFF9E6', // main app background
  card: '#FFFFFF',
  border: '#FACC6B',
  text: '#1F2933',
  muted: '#6B7280',
  header: '#F59E0B',
  tint: '#F97316',
  tintLight: '#FFEDD5',
  chipBg: '#FFF4D6',
  chipBorder: '#FDE68A',
  danger: '#DC2626',
  // top safe-area / status bar background
  statusBar: '#FFF4D6',
} as const;

const darkColors = {
  // Simple dark counterpart using same keys
  bg: '#020617',
  card: '#0f172a',
  border: '#1f2937',
  text: '#F9FAFB',
  muted: '#9CA3AF',
  header: '#FB923C',
  tint: '#FDBA74',
  tintLight: '#4B5563',
  chipBg: '#111827',
  chipBorder: '#374151',
  danger: '#F87171',
  statusBar: '#020617',
} as const;

let currentMode: ThemeMode = 'light';

export const colors: {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  header: string;
  tint: string;
  tintLight: string;
  chipBg: string;
  chipBorder: string;
  danger: string;
  statusBar: string;
} = { ...lightColors };

/**
 * Imperatively switch the runtime color palette while keeping the same "colors" shape.
 * Existing components read from this object and will see updated values on re-render.
 */
export const setThemeMode = (mode: ThemeMode) => {
  currentMode = mode;
  const palette = mode === 'dark' ? darkColors : lightColors;
  Object.assign(colors, palette);
};

export const getThemeMode = (): ThemeMode => currentMode;
