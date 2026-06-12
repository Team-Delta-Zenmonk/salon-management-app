import { Box, Typography } from "@mui/material";

export function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: React.ReactNode }) {
  return (
    <Box className="flex flex-col items-center justify-center flex-1 py-8 text-center">
      <Box className="w-14 h-14 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
        <Icon className="text-[var(--text-muted)]" style={{ fontSize: 28 }} />
      </Box>
      <Typography fontWeight={600} className="text-[var(--text-primary)] text-sm">
        {title}
      </Typography>
      {subtitle && (
        <Typography className="text-[var(--text-muted)] text-xs mt-1 max-w-[260px]">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
