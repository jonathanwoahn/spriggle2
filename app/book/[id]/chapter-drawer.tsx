'use client';

import { AppBar, Drawer, IconButton, List, ListItemButton, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { INav } from "./play/media-player";


export default function ChapterDrawer({isOpen, setIsOpen, title, navItems}: {isOpen: boolean, setIsOpen: (isOpen: boolean) => void, title: string, navItems: INav[]}) {

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      anchor={'bottom'}>
      <AppBar position="sticky" component="nav">
        <Toolbar sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 1}}>
          <Typography variant="h6" sx={{display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {title}
          </Typography>
          <IconButton onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <List>
        {navItems.map((navItem, idx) => (
          <ListItemButton key={idx} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant={"body1"} sx={{display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{navItem.label}</Typography>
            <Typography variant={"body2"}>01:23</Typography>
          </ListItemButton>
        ))}
      </List>
    </Drawer>

  );
}