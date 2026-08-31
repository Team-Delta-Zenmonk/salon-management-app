import { type ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type CustomDrawerProps = {
  open: boolean;
  onClose: () => void;
  width?: number | string;
  children: ReactNode;
  variant?: "temporary" | "permanent" | "persistent";
  showOn?: { xs?: boolean; md?: boolean };
};

const CustomDrawer = ({
  open,
  onClose,
  width = 260,
  children,
  variant = "temporary",
  showOn = { xs: true, md: true },
}: CustomDrawerProps) => {
  // If it's a permanent drawer, we typically just render a static aside.
  // For standard Shadcn, Sheet is inherently an overlay (temporary).
  // We'll mimic permanent behavior by keeping it open and disabling overlay if needed,
  // or just rendering a standard div if it's meant to be a permanent side panel.
  
  const widthStyle = typeof width === "number" ? `${width}px` : width;

  if (variant === "permanent") {
    return (
      <aside
        style={{ width: widthStyle }}
        className={cn(
          "h-full shrink-0 border-r border-border bg-background",
          !showOn.xs && "hidden md:block",
          !showOn.md && "md:hidden"
        )}
      >
        {children}
      </aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="left"
        style={{ maxWidth: widthStyle, width: "100%" }}
        className={cn(
          "p-0 border-r-border",
          !showOn.xs && "hidden md:block",
          !showOn.md && "md:hidden"
        )}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
};

export default CustomDrawer;
