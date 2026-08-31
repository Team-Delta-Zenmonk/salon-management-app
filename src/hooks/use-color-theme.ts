import { createContext, useContext } from "react";

export type ColorTheme = "rose" | "zinc" | "blue" | "emerald" | "violet" | "sunset" | "ocean" | "cyber";

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
}

export const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
