import React from "react";
import { Sun, Moon, Monitor, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";

interface PreferencesCardProps {
  themeMode: string;
  setThemeMode: (mode: string) => void;
}

export default function PreferencesCard({
  themeMode,
  setThemeMode,
}: PreferencesCardProps) {
  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Interface Theme
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80">
          Customize the theme mode settings of your workspace
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mode Selector */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Display Theme Mode
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", icon: Sun, label: "Light Mode" },
              { id: "dark", icon: Moon, label: "Dark Mode" },
              { id: "system", icon: Monitor, label: "System Default" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setThemeMode(mode.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                  themeMode === mode.id
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/80 text-foreground"
                }`}
              >
                <mode.icon className="h-5 w-5 mb-1.5 shrink-0" />
                <span className="text-[11px] font-bold">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
