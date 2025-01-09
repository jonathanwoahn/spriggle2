import { Box } from "@mui/material";
import Image from "next/image";

export default function BookCoverImage({bookId, alt, height = 250}: {bookId: string, alt?: string, height?: number}) {
  return (
    <Box sx={{borderRadius: '8px', overflow: 'hidden', boxShadow: 1, }}>
      <Image src={`/api/book/${bookId}/cover`} alt={alt || 'Book Cover'} height={height} width={height / (4/3)} />
    </Box>
    
  );
}