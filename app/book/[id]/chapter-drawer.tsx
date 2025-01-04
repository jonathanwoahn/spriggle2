'use client';

import { AppBar, Drawer, IconButton, List, ListItemButton, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';


export default function ChapterDrawer({isOpen, setIsOpen, title}: {isOpen: boolean, setIsOpen: (isOpen: boolean) => void, title: string}) {

  return (
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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((chapter, idx) => (
          <ListItemButton key={idx} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
            <Typography variant={"body1"}>{chapter}. Content</Typography>
            <Typography variant={"body2"}>01:23</Typography>
          </ListItemButton>
        ))}

      </List>
    </Drawer>

  );
}