'use client';

import { AppBar, Drawer, IconButton, List, ListItemButton, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { IBookData } from "./play/[order]/media-player";
import ChapterLength from "./chapter-length";
import { useEffect, useState } from "react";
import { INav } from "@/lib/cashmere";
import { formatDuration } from "@/lib/utils";

export default function ChapterDrawer({isOpen, setIsOpen, bookData}: {isOpen: boolean, setIsOpen: (isOpen: boolean) => void, bookData: IBookData}) {
  const [blockData, setBlockData] = useState<any>([]);

  useEffect(() => {
    const getMetadata = async () => {
      const blockResponse = await fetch(`/api/block-metadata/${bookData.uuid}/section`);
      const blockData = await blockResponse.json();
      setBlockData(blockData);
    }
    
    getMetadata();

  },[bookData]);
  
  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      anchor={'bottom'}>
      <AppBar position="sticky" component="nav">
        <Toolbar sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 1}}>
          <Typography variant="h6" sx={{display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {bookData.data.title}
          </Typography>
          <IconButton onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <List>
        {bookData.data.nav.map((navItem, idx) => (
          <ListItemButton 
            href={`/book/${bookData.uuid}/play/${navItem.order}`}
            onClick={() => setIsOpen(false)}
            key={idx}
            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant={"body1"} sx={{display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{navItem.label}</Typography>
            <Typography variant={"body2"}>{formatDuration(blockData.find((b: any) => b.section_order === navItem.order)?.data.duration / 1000)}</Typography>
          </ListItemButton>
        ))}
      </List>
    </Drawer>

  );
}