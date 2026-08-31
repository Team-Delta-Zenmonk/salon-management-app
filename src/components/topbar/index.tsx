import React from "react";
import { Menu } from "lucide-react";
import type { RootState } from "../../store/store";
import { useAppSelector } from "../../store/hooks";
import { useMediaQuery } from "../../hooks/use-media-query";
import { ThemeToggle } from "../theme-toggle";

type TopbarProps = {
  onMenuClick?: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { salon } = useAppSelector((state: RootState) => state.auth);

  return (
    <header className="border-b border-border h-[72px] flex flex-col justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 sticky top-0">
      <div className="flex items-center justify-between px-4 w-full">
        <div className="flex items-center min-w-0 flex-1">
          {onMenuClick && (
            <button 
              onClick={onMenuClick} 
              className="mr-3 p-2 -ml-2 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors" 
              aria-label="toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 
              title={salon?.name || "Salon Management Service"}
              className="text-xl font-bold tracking-tight text-foreground truncate capitalize"
            >
              {salon?.name || "Salon Management Service"}
            </h1>
          </div>
        </div>
        <div className="flex items-center shrink-0 ml-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
