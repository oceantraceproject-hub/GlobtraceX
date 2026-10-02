import React, { createContext, useContext, useState } from 'react';

interface ScienceModeContextType {
  isScienceMode: boolean;
  toggleScienceMode: () => void;
  setScienceMode: (enabled: boolean) => void;
}

const defaultContextValue: ScienceModeContextType = {
  isScienceMode: false,
  toggleScienceMode: () => {},
  setScienceMode: () => {},
};

const ScienceModeContext = createContext<ScienceModeContextType>(defaultContextValue);

export function ScienceModeProvider({ children }: { children: React.ReactNode }) {
  const [isScienceMode, setIsScienceMode] = useState(false);

  return (
    <ScienceModeContext.Provider
      value={{
        isScienceMode,
        toggleScienceMode: () => setIsScienceMode((p) => !p),
        setScienceMode: (val) => setIsScienceMode(val),
      }}
    >
      {children}
    </ScienceModeContext.Provider>
  );
}

export function useScienceMode() {
  const context = useContext(ScienceModeContext);
  return context || defaultContextValue;
}
