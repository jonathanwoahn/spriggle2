'use client';

import { Box, ButtonBase, Typography } from "@mui/material";
import BookCoverImage from "./book-cover-image";
import { IBlockMetadata } from "@/lib/types";

export default function CarouselCard({ blockMetadata }: { blockMetadata: IBlockMetadata}) {
  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
      <ButtonBase
        href={"/book/" + blockMetadata.block_id}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '200px',
          ml: 'auto',
          mr: 'auto',
          p: 2,
          gap: 2,
        }}>
        <BookCoverImage bookId={blockMetadata.book_id} />
        <Box
          component="div"
          sx={{
            display: 'block',
            width: '100%',
          }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}>{'title' in blockMetadata.data ? blockMetadata.data.title : 'Untitled'}</Typography>
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{'creators' in blockMetadata.data ? blockMetadata.data.creators?.join(', ') : ''}</Typography>
        </Box>
      </ButtonBase>

    </Box>
  );
}