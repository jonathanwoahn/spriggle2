'use client';

import { useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { signOutAction } from '@/app/actions';

interface UserMenuProps {
  userEmail?: string;
  isAdmin?: boolean;
}

export default function UserMenu({ userEmail, isAdmin }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    signOutAction();
  };

  // Get initials from email
  const initials = userEmail
    ? userEmail.charAt(0).toUpperCase()
    : 'U';

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          p: 0.5,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 1.5,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {userEmail && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(153, 102, 255, 0.04)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Signed in as
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userEmail}
            </Typography>
          </Box>
        )}

        <MenuItem
          component="a"
          href="/"
          sx={{ py: 1.25, px: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LibraryBooksRoundedIcon fontSize="small" sx={{ color: '#9966FF' }} />
          </ListItemIcon>
          My Library
        </MenuItem>

        {isAdmin && (
          <MenuItem
            component="a"
            href="/admin"
            sx={{ py: 1.25, px: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#9966FF' }} />
            </ListItemIcon>
            Admin Dashboard
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleSignOut} sx={{ py: 1.25, px: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
