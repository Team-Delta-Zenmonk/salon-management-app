import { type ReactNode } from "react";
import Drawer, { type DrawerProps } from "@mui/material/Drawer";

type CustomDrawerProps = {
  open: boolean;
  onClose: () => void;
  width?: number;
  children: ReactNode;
  variant?: DrawerProps["variant"];
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
  return (
    <Drawer
      variant={variant}
      open={variant === "permanent" ? true : open}
      onClose={variant === "temporary" ? onClose : undefined}
      ModalProps={variant === "temporary" ? { keepMounted: true } : undefined}
      sx={{
        display: {
          xs: showOn.xs ? "block" : "none",
          md: showOn.md ? "block" : "none",
        },
        width: variant === "permanent" ? width : undefined,
        flexShrink: variant === "permanent" ? 0 : undefined,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {children}
    </Drawer>
  );
};

export default CustomDrawer;
