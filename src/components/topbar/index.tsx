import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, useMediaQuery, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type { RootState } from "../../store/store";
import { useAppSelector } from "../../store/hooks";
import { shouldShowTooltip } from "../../common/shouldShowTooltip";

type TopbarProps = {
  onMenuClick?: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { salon } = useAppSelector((state: RootState) => state.auth);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <AppBar position="static" elevation={0} color="transparent" className="border-b border-gray-200 h-[72px] justify-center">
      <Toolbar disableGutters className="px-4">
        {!isDesktop && onMenuClick && (
          <IconButton edge="start" onClick={onMenuClick} className="mr-2" aria-label="open sidebar">
            <MenuIcon />
          </IconButton>
        )}

        <Box className="flex-1 min-w-0">
          <Tooltip title={salon?.name || "Salon Management Service"} open={tooltipOpen} onClose={() => setTooltipOpen(false)} disableHoverListener>
            <Typography
              onMouseEnter={(e) => {
                if (shouldShowTooltip(e.currentTarget)) setTooltipOpen(true);
              }}
              onMouseLeave={() => setTooltipOpen(false)}
              variant="h4" fontWeight={600} className="text-(--primary-900) truncate" sx={{ textTransform: "capitalize" }}
            >
              {salon?.name || "Salon Management Service"}
            </Typography>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
