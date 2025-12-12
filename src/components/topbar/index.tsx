import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type TopbarProps = {
  onMenuClick?: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <AppBar position="static" elevation={0} color="transparent">
      <Toolbar disableGutters className="min-h-14">
        {!isDesktop && onMenuClick && (
          <IconButton edge="start" onClick={onMenuClick} className="mr-2" aria-label="open sidebar">
            <MenuIcon />
          </IconButton>
        )}

        <Box>
          <Typography variant="h4" fontWeight={600} className="text-(--primary-900)">
            Salon Management Service
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here&apos;s what&apos;s happening today.
          </Typography>
        </Box>

        <Box />

        {/* Right side: user avatar, notifications, etc. */}
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
