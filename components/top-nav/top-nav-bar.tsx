'use client';

import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import TopNavMenuButton from "./top-nav-menu-button";
import UserMenu from "../user-menu";

// Default colors (purple brand)
const DEFAULT_PRIMARY = 'rgba(153, 102, 255, 0.85)';
const DEFAULT_SECONDARY = 'rgba(122, 82, 204, 0.85)';

const SignInButtons = () => (
  <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
    <Button
      variant="contained"
      href="/sign-up"
      sx={{
        bgcolor: "white",
        color: "#9966FF",
        fontWeight: 600,
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.9)",
        },
      }}
    >
      Sign Up
    </Button>
    <Button
      href="/sign-in"
      sx={{
        color: "white",
        fontWeight: 500,
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      Sign In
    </Button>
  </Box>
);

interface TopNavBarProps {
  isAdmin: boolean;
  isUser: boolean;
  userEmail?: string;
}

export default function TopNavBar({ isAdmin, isUser, userEmail }: TopNavBarProps) {
  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        background: `linear-gradient(135deg, var(--accent-primary, ${DEFAULT_PRIMARY}) 0%, var(--accent-secondary, ${DEFAULT_SECONDARY}) 100%)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: '0 4px 20px rgba(153, 102, 255, 0.2)',
        transition: "background 0.5s ease",
      }}
    >
      <Toolbar sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            href="/"
            sx={{
              color: "white",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <AutoStoriesIcon sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              Spriggle
            </Typography>
          </Button>
          <TopNavMenuButton />
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {isUser ? <UserMenu userEmail={userEmail} isAdmin={isAdmin} /> : <SignInButtons />}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
