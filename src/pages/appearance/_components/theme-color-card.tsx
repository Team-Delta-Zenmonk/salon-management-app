import React from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import type { ColorTheme } from "../../../hooks/use-color-theme";
import { motion } from "framer-motion";

const themePresets = [
  { id: "zinc", name: "Zinc Minimal", color: "#18181b", darkColor: "#fafafa", description: "Sleek and clean monochrome" },
  { id: "rose", name: "Rose Crimson", color: "#e11d48", darkColor: "#fb7185", description: "Vibrant romance crimson" },
  { id: "blue", name: "Midnight Blue", color: "#2563eb", darkColor: "#3b82f6", description: "Deep tech professional" },
  { id: "emerald", name: "Emerald Green", color: "#10b981", darkColor: "#34d399", description: "Organic freshness" },
  { id: "violet", name: "Violet Purple", color: "#8b5cf6", darkColor: "#a78bfa", description: "Premium creative purple" },
  { id: "sunset", name: "Sunset Orange", color: "#f97316", darkColor: "#fb923c", description: "Energetic golden sunset" },
  { id: "ocean", name: "Ocean Breeze", color: "#06b6d4", darkColor: "#22d3ee", description: "Crisp and calming cyan" },
  { id: "cyber", name: "Neon Cyber", color: "#d946ef", darkColor: "#e879f9", description: "Futuristic neon magenta" },
];

interface ThemeColorCardProps {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  themeMode: string;
}

export default function ThemeColorCard({
  colorTheme,
  setColorTheme,
  themeMode,
}: ThemeColorCardProps) {
  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Color Branding
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80">
          Select an application theme preset to align with your brand
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preset list */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Theme Preset
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {themePresets.map((preset) => {
              const active = colorTheme === preset.id;
              const displayBg = themeMode === "dark" ? preset.darkColor : preset.color;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setColorTheme(preset.id as ColorTheme);
                  }}
                  className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 w-full">
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0"
                      style={{ backgroundColor: displayBg }}
                    />
                    <span className="text-xs font-bold text-foreground truncate flex-1">
                      {preset.name.split(" ")[0]}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground leading-tight truncate w-full">
                    {preset.description}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="active-theme-check"
                      className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
                    >
                      <Check className="h-2 w-2" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
