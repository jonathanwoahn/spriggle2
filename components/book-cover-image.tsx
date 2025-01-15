import { Box } from "@mui/material";
import Image from "next/image";

export default function BookCoverImage({bookId, alt, height = 250}: {bookId: string, alt?: string, height?: number}) {
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
        src={`https://omnibk.ai/api/v1/book/${bookId}/cover_image`}
        alt={alt || 'Book Cover'}
        width={0}
        height={0}
        sizes={`${height}`}
        style={{width: 'auto', height: '100%'}}
        priority={true}
      />
    </Box>
  );
}