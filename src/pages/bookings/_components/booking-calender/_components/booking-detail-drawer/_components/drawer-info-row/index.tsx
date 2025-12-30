import { Box, Typography } from "@mui/material";

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export default function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box className="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-100 p-3">
      <Box className="mt-0.5 text-gray-600">{icon}</Box>
      <Box className="min-w-0 flex-1">
        <Typography variant="caption" className="text-gray-500">
          {label}
        </Typography>
        <Typography className="text-gray-900 font-medium wrap-anywhere">{value}</Typography>
      </Box>
    </Box>
  );
}
