import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Toolbar } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import CollectionsIcon from '@mui/icons-material/Collections';
import SettingsIcon from '@mui/icons-material/Settings';

export default function AdminMenu() {
  const buttons = [
    {
      label: 'Dashboard',
      icon: <HomeIcon />,
      url: '/admin',
    },
    {
      label: 'Collections',
      icon: <CollectionsIcon />,
      url: '/admin/collections',
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      url: '/admin/settings',
    },
  ];
  
  
  return (
    <Box sx={{width: 300 }}>
      <Box>
        <List>
          {buttons.map((button, idx) => (
            <ListItemButton key={idx} href={button.url}>
              <ListItemIcon>{button.icon}</ListItemIcon>
              <ListItemText>
                {button.label}
              </ListItemText>
            </ListItemButton>
          ))}
          
        </List>
      </Box>
    </Box>
  );
}