'use client';

import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import CollectionsIcon from '@mui/icons-material/Collections';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePathname } from "next/navigation";
import { useMenuContext } from "@/context/admin-menu-context";
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

const drawerWidth = 260;

export default function AdminMenu() {
  const theme = useTheme();
  const { mobileOpen, handleDrawerClose, handleDrawerTransitionEnd, handleDrawerToggle } = useMenuContext();

  const path = usePathname();
  const buttons = [
    {
      label: 'Dashboard',
      icon: <HomeIcon />,
      url: '/admin',
    },
    {
      label: 'Catalog',
      icon: <MenuBookIcon />,
      url: '/admin/catalog',
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
      label: 'Ingestions',
      icon: <CloudSyncIcon />,
      url: '/admin/ingestions',
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      url: '/admin/settings',
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(153, 102, 255, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #9966FF 0%, #FF8866 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AdminPanelSettingsIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'white',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
              }}
            >
              Admin Portal
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Spriggle Management
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            display: { sm: 'none' },
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2, px: 1.5 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'rgba(255, 255, 255, 0.4)',
            px: 1.5,
            mb: 1,
            display: 'block',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
          }}
        >
          Navigation
        </Typography>
        <List sx={{ p: 0 }}>
          {buttons.map((button, idx) => {
            const isSelected = path === button.url;
            return (
              <ListItemButton
                key={idx}
                href={button.url}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.25,
                  px: 1.5,
                  color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(153, 102, 255, 0.3) 0%, rgba(255, 136, 102, 0.2) 100%)'
                    : 'transparent',
                  border: isSelected ? '1px solid rgba(153, 102, 255, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(153, 102, 255, 0.4) 0%, rgba(255, 136, 102, 0.3) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isSelected ? '#9966FF' : 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {button.icon}
                </ListItemIcon>
                <ListItemText
                  primary={button.label}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                />
                {isSelected && (
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, #9966FF 0%, #FF8866 100%)',
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(153, 102, 255, 0.2)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.3)',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Spriggle Admin v1.0
        </Typography>
      </Box>
    </Box>
  );

  const drawerStyles = {
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: drawerWidth,
      border: 'none',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
    },
  };

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        zIndex: theme.zIndex.appBar - 1,
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          ...drawerStyles,
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          ...drawerStyles,
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}