'use client';

import { AppBar, Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import React from "react";


export default function BookChapters({open, title}: {open: boolean, title: string}) {
  const [isOpen, setIsOpen] = React.useState(open);
  
  return (
    <Drawer open={isOpen} anchor={'bottom'}>
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
        {/* <Toolbar /> */}
        <ListItemButton sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
          <Typography variant={"body1"}>Content</Typography>
          <Typography variant={"body2"}>01:23</Typography>
        </ListItemButton>
      </List>
    </Drawer>
  );
}