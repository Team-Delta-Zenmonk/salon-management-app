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
