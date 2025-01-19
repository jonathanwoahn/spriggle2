'use client';

import { Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import BookIngestionStatusBar from "./book-ingestion-status-bar";

export default function BookIngestionItem({
    thinking,
    label,
    content,
    total,
    max,
  }: {
    thinking: boolean,
    label: string,
    content: string,
    total: number,
    max: number,
  }) {
  return (
    <Box sx={{ flex: 1, justifyContent: 'center', display: 'flex', flexDirection: 'column', }}>
      <Typography variant="caption" sx={{ textAlign: 'center', width: '100%', lineHeight: '20px' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '54px', }}>
        {thinking ?
          <CircularProgress size={25} color="inherit" /> :
          <>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>
                {content ? content : 'N/A'}
              </Typography>
            </Box>
            <BookIngestionStatusBar total={total} max={max} />
          </>
        }

      </Box>
    </Box>
  );
}