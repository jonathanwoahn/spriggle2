'use client';

import { Button } from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import React from "react";
import ChapterDrawer from "./chapter-drawer";
import { IBookData } from "./play/media-player";

export default function ChaptersButton({bookData}: {bookData: IBookData}) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  
  return (
    <>
      <Button startIcon={<ListIcon />} variant="outlined" color="secondary" onClick={() => setIsOpen(true)}>Chapters</Button>
      <ChapterDrawer isOpen={isOpen} setIsOpen={setIsOpen} navItems={bookData.data.nav} title={bookData.data.title} />
    </>
  );
}