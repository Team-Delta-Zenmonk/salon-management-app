import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTheme } from "next-themes";
import { useColorTheme, type ColorTheme } from "../../hooks/use-color-theme";
import { Button } from "../../components/ui/button";
import { callSnack } from "../../components/snackbar";
import { Save, RotateCcw, AlertCircle, Sparkles } from "lucide-react";

// Config Components
import ThemeColorCard from "./_components/theme-color-card";
import PreferencesCard from "./_components/preferences-card";
import LivePreviewPanel from "./_components/live-preview-panel";

// Container Framer Motion animation presets
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 26 } }
};

export default function Appearance() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();

  // Primary branding states
  const [activeColorTheme, setActiveColorTheme] = useState<ColorTheme>(colorTheme);
  const [themeMode, setThemeMode] = useState(() => theme || "light");

  // Keep track of originally saved states to check if form is dirty
  const [originalSettings, setOriginalSettings] = useState<string>(() => 
    JSON.stringify({
      colorTheme,
      themeMode: theme || "light",
    })
  );

  const [prevTheme, setPrevTheme] = useState(theme);
  if (theme !== prevTheme) {
    setPrevTheme(theme);
    if (theme) {
      setThemeMode(theme);
      setOriginalSettings(
        JSON.stringify({
          colorTheme,
          themeMode: theme,
        })
      );
    }
  }

  const loadSettings = () => {
    const savedMode = theme || "light";
    setActiveColorTheme(colorTheme);
    setThemeMode(savedMode);
    setOriginalSettings(
      JSON.stringify({
        colorTheme,
        themeMode: savedMode,
      })
    );
  };


  // Check if anything has been modified since last save
  const currentSnapshot = JSON.stringify({
    colorTheme: activeColorTheme,
    themeMode,
  });

  const isDirty = originalSettings !== "" && originalSettings !== currentSnapshot;

  const handleSave = () => {
    // Update global app state variables
    setColorTheme(activeColorTheme);
    setTheme(themeMode);

    // Save new snapshot
    setOriginalSettings(currentSnapshot);
    callSnack("Appearance settings saved successfully", "success");
  };

  const handleResetToDefaults = () => {
    setActiveColorTheme("sunset");
    setThemeMode("light");
    callSnack("Reset to brand defaults in preview", "info");
  };

  const handleCancelChanges = () => {
    loadSettings();
    callSnack("Unsaved changes discarded", "info");
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 w-full overflow-hidden">
      
      {/* Top Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 pb-6 shrink-0 gap-4"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Appearance & Branding
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
          </h1>
          <p className="text-muted-foreground/80 text-sm">
            Elevate your salon workspace branding and theme colors
          </p>
        </div>
      </motion.div>

      {/* Main Body Configuration Panel */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 pb-0">
        <div className="max-w-[1600px] mx-auto w-full pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            
            {/* Left Side: Configurator */}
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="show" 
              className="lg:col-span-3 space-y-6"
            >
              <motion.div variants={itemVariants}>
                <ThemeColorCard
                  colorTheme={activeColorTheme}
                  setColorTheme={setActiveColorTheme}
                  themeMode={themeMode}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <PreferencesCard
                  themeMode={themeMode}
                  setThemeMode={setThemeMode}
                />
              </motion.div>
            </motion.div>

            {/* Right Side: Sticky Live Preview */}
            <div className="lg:col-span-2 lg:sticky lg:top-0 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Branding Real-Time Preview
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  Updates instantly
                </span>
              </div>
              <LivePreviewPanel
                colorTheme={activeColorTheme}
                themeMode={themeMode}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Floating Action Banner for Unsaved Changes */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl"
          >
            <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">You have unsaved changes</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Save to apply branding updates to the workspace
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleCancelChanges}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Discard
                </Button>
                <Button
                  size="xs"
                  onClick={handleSave}
                  className="text-[11px] font-bold rounded-full h-8 px-4 shadow-md shadow-primary/20 hover:opacity-95"
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default/Reset footer panel if not dirty */}
      {!isDirty && (
        <div className="shrink-0 px-8 py-4 border-t border-border/20 bg-muted/10 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            className="rounded-full px-5 h-9 text-xs font-bold border-border/50 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
          >
            Reset to Defaults
          </Button>
        </div>
      )}

    </div>
  );
}
