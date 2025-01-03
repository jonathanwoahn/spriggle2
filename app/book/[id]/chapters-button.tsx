'use client';

import { AppBar, Button, Drawer, IconButton, List, ListItemButton, Toolbar, Typography } from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';

import React from "react";


export default function ChaptersButton({title}: {title?: string}) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  
  
  return (
    <>
      <Button startIcon={<ListIcon />} variant="outlined" color="secondary" onClick={() => setIsOpen(true)}>Chapters</Button>
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchor={'bottom'}>
        <AppBar position="sticky" component="nav">
          <Toolbar sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
            <Typography variant="h6">
              {title}
            </Typography>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <List>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((chapter, idx) => (
            <ListItemButton key={idx} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
              <Typography variant={"body1"}>{chapter}. Content</Typography>
              <Typography variant={"body2"}>01:23</Typography>
            </ListItemButton>
          ))}
          
        </List>
      </Drawer>
    </>

  );
}