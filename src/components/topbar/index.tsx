import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, useMediaQuery, Tooltip, Badge, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Link as RouterLink } from "react-router-dom";
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
    <AppBar position="static" elevation={0} color="transparent" className="border-b border-[var(--border-subtle)] bg-[var(--surface)] h-[72px] justify-center">
      <Toolbar disableGutters className="px-6 lg:px-8 w-full">
        {onMenuClick && (
          <IconButton edge="start" onClick={onMenuClick} className="mr-6 text-[var(--text-primary)]!" aria-label="open sidebar">
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
              variant="h4" className="text-[var(--text-primary)] truncate tracking-tight" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "1.75rem" }, textTransform: "capitalize" }}
            >
              {salon?.name || "Salon Management Service"}
            </Typography>
          </Tooltip>
        </Box>

        <Box className="flex items-center gap-4 ml-4 shrink-0">
          <Tooltip title="Notifications">
            <IconButton color="inherit" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <Badge color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }}>
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Profile">
            <IconButton
              component={RouterLink}
              to="/my-profile"
              color="inherit"
              sx={{ p: 0 }}
            >
              <Avatar
                src={salon?.logo || undefined}
                alt={salon?.owner_name || "Profile"}
                sx={{ width: 40, height: 40, border: '2px solid transparent', '&:hover': { borderColor: 'var(--primary-main)' }, transition: 'border-color 0.2s' }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
