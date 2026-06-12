import { Box } from "@mui/material";

export function DashCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Box className={`bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[20px] shadow-sm p-6 flex flex-col ${className}`}>
      {children}
    </Box>
  );
}
