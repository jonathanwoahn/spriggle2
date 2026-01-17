'use client';

import { Button } from "@mui/material";
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import React from "react";
import ChapterDrawer from "./chapter-drawer";
import { IBookData } from "@/lib/types";

interface ChaptersButtonProps {
  bookData: IBookData;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function ChaptersButton({
  bookData,
  primaryColor,
  secondaryColor,
}: ChaptersButtonProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <>
      <Button
        startIcon={<FormatListBulletedRoundedIcon />}
        variant="outlined"
        onClick={() => setIsOpen(true)}
        sx={{
          py: 1.5,
          px: 3,
          borderRadius: 3,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          borderColor: 'rgba(255,255,255,0.5)',
          color: 'white',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            borderColor: 'white',
            background: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        Chapters
      </Button>
      <ChapterDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        bookData={bookData}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </>
  );
}