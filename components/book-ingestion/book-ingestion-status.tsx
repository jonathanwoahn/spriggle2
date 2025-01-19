import { Box, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import BookIngestionJobItem from "./book-ingestion-job-item";


export default async function BookIngestionStatus({bookId}: {bookId: string}) {
  
  return (
    <Stack direction="column" spacing={3} sx={{my: 1, p: 2}}>
      <BookIngestionJobItem bookId={bookId} />
    </Stack>
  );
}