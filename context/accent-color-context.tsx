'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AccentColors {
  primary: string;
  secondary: string;
}

interface AccentColorContextType {
  colors: AccentColors;
  setColors: (colors: AccentColors) => void;
  resetColors: () => void;
}

const defaultColors: AccentColors = {
  primary: 'rgba(153, 102, 255, 0.85)',
  secondary: 'rgba(122, 82, 204, 0.85)',
};

const AccentColorContext = createContext<AccentColorContextType>({
  colors: defaultColors,
  setColors: () => {},
  resetColors: () => {},
});

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<AccentColors>(defaultColors);

  const setColors = useCallback((newColors: AccentColors) => {
    setColorsState(newColors);
  }, []);

  const resetColors = useCallback(() => {
    setColorsState(defaultColors);
  }, []);

  return (
    <AccentColorContext.Provider value={{ colors, setColors, resetColors }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColors() {
  return useContext(AccentColorContext);
}
