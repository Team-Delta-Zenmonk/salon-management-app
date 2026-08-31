import React, { useEffect, useState } from "react";
import { ColorThemeContext, type ColorTheme } from "../hooks/use-color-theme";

export function ColorThemeProvider({ children, defaultColor = "sunset" }: { children: React.ReactNode, defaultColor?: ColorTheme }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem("app-color-theme") as ColorTheme;
    return saved || defaultColor;
  });

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
    localStorage.setItem("app-color-theme", color);
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove existing color classes
    root.classList.remove(
      "theme-rose", 
      "theme-zinc", 
      "theme-blue", 
      "theme-emerald", 
      "theme-violet",
      "theme-sunset",
      "theme-ocean",
      "theme-cyber"
    );
    // Add the selected color class
    root.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}
