import React from "react";
import { 
  BarChart, Calendar, Search, RefreshCw, Layers 
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useAppSelector } from "../../../store/hooks";
import { type RootState } from "../../../store/store";
import type { ColorTheme } from "../../../hooks/use-color-theme";

interface LivePreviewPanelProps {
  colorTheme: ColorTheme;
  themeMode: string;
}

interface ThemePalette {
  background: string;
  foreground: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
  muted: string;
}

const themePaletteMap: Record<ColorTheme, { light: ThemePalette; dark: ThemePalette }> = {
  zinc: {
    light: { background: "#fafafa", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#18181b", secondary: "#71717a", muted: "#f4f4f5" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#fafafa", secondary: "#3f3f46", muted: "#27272a" }
  },
  rose: {
    light: { background: "#fff1f2", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#e11d48", secondary: "#f43f5e", muted: "#ffe4e6" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#fb7185", secondary: "#e11d48", muted: "#27272a" }
  },
  blue: {
    light: { background: "#eff6ff", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#2563eb", secondary: "#3b82f6", muted: "#e0f2fe" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#3b82f6", secondary: "#2563eb", muted: "#27272a" }
  },
  emerald: {
    light: { background: "#ecfdf5", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#10b981", secondary: "#059669", muted: "#d1fae5" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#34d399", secondary: "#10b981", muted: "#27272a" }
  },
  violet: {
    light: { background: "#f5f3ff", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#8b5cf6", secondary: "#7c3aed", muted: "#ede9fe" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#a78bfa", secondary: "#8b5cf6", muted: "#27272a" }
  },
  sunset: {
    light: { background: "#fff7ed", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#f97316", secondary: "#ea580c", muted: "#ffedd5" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#fb923c", secondary: "#f97316", muted: "#27272a" }
  },
  ocean: {
    light: { background: "#ecfeff", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#06b6d4", secondary: "#0891b2", muted: "#cffafe" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#22d3ee", secondary: "#06b6d4", muted: "#27272a" }
  },
  cyber: {
    light: { background: "#fdf4ff", foreground: "#211922", card: "#ffffff", border: "#dadad3", primary: "#d946ef", secondary: "#c084fc", muted: "#fae8ff" },
    dark: { background: "#09090b", foreground: "#fafafa", card: "#18181b", border: "#27272a", primary: "#e879f9", secondary: "#d946ef", muted: "#27272a" }
  }
};

const getContrastColor = (hex: string) => {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? "#09090b" : "#ffffff";
};

export default function LivePreviewPanel({
  colorTheme,
  themeMode,
}: LivePreviewPanelProps) {
  const palette = themePaletteMap[colorTheme] || themePaletteMap.sunset;
  const currentPalette = themeMode === "dark" ? palette.dark : palette.light;

  const styleVariables = {
    "--background": currentPalette.background,
    "--foreground": currentPalette.foreground,
    "--card": currentPalette.card,
    "--border": currentPalette.border,
    "--primary": currentPalette.primary,
    "--muted": currentPalette.muted,
  } as React.CSSProperties;

  // Retrieve salon details from the auth store
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const brandName = salon?.name || "Velvet & Co";

  // Render mock data
  const mockAppointments = [
    { client: "Sophia Loren", service: "Balayage", time: "10:30 AM", status: "Completed" },
    { client: "Marcus Aurelius", service: "Classic Fade", time: "11:15 AM", status: "In Progress" },
    { client: "Emma Watson", service: "Gel Nails", time: "12:00 PM", status: "Scheduled" },
  ];

  return (
    <div 
      style={styleVariables}
      className="relative w-full rounded-3xl border border-border bg-background text-foreground shadow-xl overflow-hidden transition-all duration-300"
    >
      {/* Dynamic Glow decoration matching primary color */}
      <div 
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: currentPalette.primary }}
      />
      <div 
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: currentPalette.secondary }}
      />

      {/* Header bar */}
      <div className="px-4 py-3.5 border-b border-border/50 bg-card/60 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div 
            style={{ backgroundColor: currentPalette.primary, color: getContrastColor(currentPalette.primary) }}
            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm"
          >
            {brandName ? brandName.charAt(0).toUpperCase() : "S"}
          </div>
          <span className="font-bold text-sm tracking-tight capitalize truncate max-w-[120px]">
            {brandName || "Velvet & Co"}
          </span>
        </div>

        {/* Mock Search Input */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted/60 text-[10px] text-muted-foreground w-28">
          <Search className="h-3 w-3 shrink-0" />
          <span>Search...</span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="p-4 space-y-4 relative z-10 transition-all duration-300">
        
        {/* Top Header Mockup */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Salon Dashboard</h4>
            <h2 className="text-sm font-bold text-foreground">Welcome Back</h2>
          </div>
          <Badge 
            style={{ backgroundColor: `${currentPalette.primary}15`, color: currentPalette.primary, borderColor: `${currentPalette.primary}30` }}
            className="border font-bold text-[9px] rounded-full px-2 py-0.5"
          >
            Live Preview
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1 */}
          <div className="p-3 rounded-2xl border border-border bg-card/70">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: currentPalette.primary, color: getContrastColor(currentPalette.primary) }}
              >
                <BarChart className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">Today's Sales</span>
            </div>
            <p className="text-base font-extrabold text-foreground tracking-tight">$1,450</p>
          </div>

          {/* Card 2 */}
          <div className="p-3 rounded-2xl border border-border bg-card/70">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: currentPalette.secondary, color: getContrastColor(currentPalette.secondary) }}
              >
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">Appointments</span>
            </div>
            <p className="text-base font-extrabold text-foreground tracking-tight">18 Clients</p>
          </div>
        </div>

        {/* Form controls mockup */}
        <div className="p-3.5 rounded-2xl border border-border bg-card/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Interactive Elements</span>
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              style={{ backgroundColor: currentPalette.primary, color: getContrastColor(currentPalette.primary) }}
              className="text-[10px] font-bold rounded-full px-3.5 h-7 hover:opacity-90 transition-all shadow-sm shadow-primary/20"
            >
              Primary
            </Button>
            <Button
              variant="outline"
              size="xs"
              style={{ borderColor: `${currentPalette.primary}40`, color: currentPalette.primary }}
              className="text-[10px] font-bold rounded-full px-3.5 h-7 hover:bg-muted/10 transition-all bg-transparent"
            >
              Outline
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground h-7"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Table Mockup */}
        <div className="border border-border rounded-2xl overflow-hidden bg-card/50">
          <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between bg-muted/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Queue Schedule</span>
            <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin-slow" />
          </div>

          <div className="divide-y divide-border/40">
            {mockAppointments.map((app, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between transition-all px-3 py-2.5"
              >
                <div>
                  <p className="text-[10px] font-bold text-foreground">{app.client}</p>
                  <p className="text-[8px] text-muted-foreground">{app.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold text-foreground mb-0.5">{app.time}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    app.status === "Completed" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : app.status === "In Progress"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
