'use client';

import { Button } from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import React from "react";
import ChapterDrawer from "./chapter-drawer";

export default function ChaptersButton({title}: {title: string}) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  
  return (
    <>
      <Button startIcon={<ListIcon />} variant="outlined" color="secondary" onClick={() => setIsOpen(true)}>Chapters</Button>
      <ChapterDrawer isOpen={isOpen} setIsOpen={setIsOpen} title={title} />
    </>
  );
}