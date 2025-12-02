import React from 'react';
import { colors, getThemeMode, setThemeMode, type ThemeMode } from './colors';

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeModeContext = React.createContext<ThemeModeContextValue>({
  mode: getThemeMode(),
  // default no-op; real implementation provided in provider
  setMode: () => {},
  toggle: () => {},
});

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = React.useState<ThemeMode>(getThemeMode());

  React.useEffect(() => {
    // keep global colors object in sync with selected mode
    setThemeMode(mode);
  }, [mode]);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
  };

  const toggle = () => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => React.useContext(ThemeModeContext);
