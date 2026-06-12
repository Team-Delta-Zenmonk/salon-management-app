import React, { type ReactNode } from "react";
import { Box, Typography, Stack } from "@mui/material";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  meta?: ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, meta }) => {
  return (
    <Box className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <Box>
        <Typography variant="h1" className="text-[var(--text-primary)] font-bold mb-1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" className="text-[var(--text-muted)]">
            {subtitle}
          </Typography>
        )}
        {meta && <Box className="mt-2">{meta}</Box>}
      </Box>
      {action && <Box className="shrink-0">{action}</Box>}
    </Box>
  );
};

export default PageHeader;
