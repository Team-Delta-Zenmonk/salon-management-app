import { Box, LinearProgress } from "@mui/material";

interface LinearProgressBarProps {
  step: number;
  totalSteps: number;
}

export function LinearProgressBar({ step, totalSteps }: LinearProgressBarProps) {
  const value = (step / totalSteps) * 100;

  return (
    <Box>
      <LinearProgress variant="determinate" value={value} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  );
}
