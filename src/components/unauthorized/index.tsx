import ContentCutIcon from "@mui/icons-material/ContentCut";
import { Box, Button, Typography } from "@mui/material";

export default function Unauthorized() {
  const handleGoBack = () => {
    globalThis.history.back();
  };
  return (
    <Box className="min-h-screen bg-white flex items-center justify-center p-4">
      <Box className="max-w-lg w-full text-center rounded-xl border border-[#e5e5e5] p-6">
        <Box className="flex justify-center mb-6">
          <Box className="w-24 h-24 bg-(--primary-900)! rounded-full flex items-center justify-center">
            <ContentCutIcon className="text-white!" />
          </Box>
        </Box>

        <Box className="mb-4">
          <Typography className="text-blue-900" variant="h1">403</Typography>
        </Box>
        <Typography className="text-gray-900 mb-3">Access Denied</Typography>
        <Box className="text-gray-600 mb-8">
          You don't have permission to access this page. This area is restricted to authorized users only.
        </Box>
        <Box className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left">
          <Typography className="text-gray-700 mb-2">This might have happened because:</Typography>
          <ul className="text-gray-600 space-y-1 ml-4">
            <li>• You don't have the required permissions</li>
            <li>• Your session has expired</li>
            <li>• This feature is restricted to administrators</li>
            <li>• Your account hasn't been fully activated</li>
          </ul>
        </Box>
        <Box className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="contained"
            onClick={handleGoBack}
            className="px-6 py-2.5 border border-blue-900 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
