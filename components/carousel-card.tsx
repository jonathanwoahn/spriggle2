'use client';

import { Box, ButtonBase, Typography } from "@mui/material";
import BookCoverImage from "./book-cover-image";
import { useEffect, useState } from "react";
import { IBookData } from "@/lib/types";

export default function CarouselCard({bookId}: {bookId: string}) {

  const [book, setBook] = useState<IBookData>();

  useEffect(() => {

    const init = async () => {
      const res = await fetch(`/api/book/${bookId}`);

      const data = await res.json();
      setBook(data);
    }

    init();

  },[bookId]);
  
  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
      <ButtonBase
        href={"/book/" + bookId}
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
        <BookCoverImage bookId={bookId} />
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
            }}>{book?.data.title}</Typography>
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{book?.data.creators?.join(', ')}</Typography>
        </Box>
      </ButtonBase>

    </Box>
  );
}