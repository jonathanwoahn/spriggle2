import { Box } from "@mui/material";
import Image from "next/image";

export default function BookCoverImage({bookId, alt, height = 250}: {bookId: string, alt?: string, height?: number}) {
  const width = `${height / (4/3)}px`;
  
  return (
    <Box sx={{
      position: 'relative',
      height: `${height}px`,
      overflow: 'hidden',
      borderRadius: '8px',
      display: 'inline-block', // Ensure the parent container adjusts its width based on the child image
      width: 'auto', // Set width to auto to adjust based on the image
    }}>
      <Image
      src={`/api/book/${bookId}/cover`}
      alt={alt || 'Book Cover'}
      width={0}
      height={0}
      sizes="100vw"
      style={{width: 'auto', height: '100%'}}
      />
    </Box>
  );
}