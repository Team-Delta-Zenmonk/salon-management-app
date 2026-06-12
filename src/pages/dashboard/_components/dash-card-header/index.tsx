import { Box, Typography } from "@mui/material";

export function DashCardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box className="mb-5">
      <Typography fontWeight={700} className="text-[var(--text-primary)] text-base">
        {title}
      </Typography>
      {subtitle && (
        <Typography className="text-[var(--text-muted)] text-xs mt-0.5">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
