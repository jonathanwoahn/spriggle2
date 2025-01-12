'use client';
import { Box, Chip } from "@mui/material";
import { useState } from "react";

export default function BookCollectionChips({bookId}: {bookId: string}) {
  const [labels, setLabels] = useState<string[]>([]);

  // update this component to fetch the collections this book is a part of

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        p: 2,
        overflowX: 'scroll',
        overflow: 'hidden',
        gap: 1,
      }}>
      {labels.map((label, idx) => (
        <Chip label={label} key={idx}></Chip>
      ))}
    </Box>

  );
}