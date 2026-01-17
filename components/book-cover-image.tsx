import { Box } from "@mui/material";
import Image from "next/image";

interface BookCoverImageProps {
  bookId: string;
  alt?: string;
  height?: number;
  width?: string | number;
  noBorderRadius?: boolean;
}

export default function BookCoverImage({
  bookId,
  alt,
  height = 250,
  width,
  noBorderRadius = false,
}: BookCoverImageProps) {
  // If width is specified and height is 0, use width-based sizing
  const useWidthSizing = width && height === 0;

  return (
    <Box
      sx={{
        position: 'relative',
        height: useWidthSizing ? 'auto' : `${height}px`,
        width: useWidthSizing ? width : 'auto',
        overflow: 'hidden',
        borderRadius: noBorderRadius ? 0 : '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
      }}
    >
      <Image
        src={`https://omnibk.ai/api/v2/omnipub/${bookId}/cover_image`}
        alt={alt || 'Book Cover'}
        width={0}
        height={0}
        sizes="(max-width: 768px) 70vw, 280px"
        style={{
          width: useWidthSizing ? '100%' : 'auto',
          height: useWidthSizing ? 'auto' : '100%',
          display: 'block',
        }}
        priority={true}
      />
    </Box>
  );
}
