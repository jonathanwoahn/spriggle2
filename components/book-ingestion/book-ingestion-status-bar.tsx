import { Box } from "@mui/material";

export default function BookIngestionStatusBar({total, max}: {total: number, max: number}) {
  return (
    <Box component="div" sx={{ height: '3px', bgcolor: 'red', width: '100%', borderRadius: '5px', overflow: 'hidden' }}>
      <Box component="div" sx={{ height: '100%', width: `${total / max * 100 || 0}%`, bgcolor: 'green' }} />
    </Box>
  );

}
