'use client';

import { Box, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Paper, Switch, Toolbar, useTheme } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import CollectionsIcon from '@mui/icons-material/Collections';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePathname } from "next/navigation";
import { useMenuContext } from "@/context/admin-menu-context";
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MemoryIcon from '@mui/icons-material/Memory';

const drawerWidth = 240;

export default function AdminMenu() {
  const theme = useTheme();
  const { mobileOpen, isClosing, handleDrawerClose, handleDrawerTransitionEnd, handleDrawerToggle } = useMenuContext();
  
  const path = usePathname();
  const buttons = [
    {
      label: 'Dashboard',
      icon: <HomeIcon />,
      url: '/admin',
    },
    {
      label: 'Books',
      icon: <LibraryBooksIcon />,
      url: '/admin/books',
    },
    {
      label: 'Collections',
      icon: <CollectionsIcon />,
      url: '/admin/collections',
    },
    {
      label: 'Jobs',
      icon: <WorkIcon />,
      url: '/admin/jobs',
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      url: '/admin/settings',
    },
  ];
  const drawer = (
    <Box component="div">
      <Toolbar sx={{display: 'flex', flexDirection: 'row', justifyContent: 'end'}}>
        <IconButton onClick={handleDrawerToggle} sx={{diplay: {sm: 'none'}}}>
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <ListSubheader>Admin Menu</ListSubheader>
      <List>
        {buttons.map((button, idx) => (
          <ListItemButton
            selected={path === button.url}
            key={idx}
            href={button.url}>
            <ListItemIcon>{button.icon}</ListItemIcon>
            <ListItemText>
              {button.label}
            </ListItemText>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
  
  return (
    <Box 
      sx={{
        width: {
          sm: drawerWidth,
        },
        flexShrink: {
          sm: 0,
        },
        zIndex: theme.zIndex.appBar - 1,
      }}
      component="nav"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: 'block', sm: 'none',
          },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box', width: drawerWidth,
          }
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: {xs: 'none', sm: 'block'},
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}