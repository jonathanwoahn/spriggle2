import { AppBar, Box, Button, IconButton, Toolbar } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "./sign-out-button";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TopNavMenuButton from "./top-nav-menu-button";

const SignInButtons = () => (
  <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}}>
    <Button color="primary" variant="contained" href="/sign-up">
      Sign Up
    </Button>
    <Button color="secondary" href="/sign-in">
      Sign In
    </Button>
  </Box>
);

export default async function TopNav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppBar position="sticky">
      <Toolbar sx={{alignItems: 'center', justifyContent: 'space-between'}}>
        <Box sx={{display: 'flex', gap: 2}}>
          <Button color="info" startIcon={<HomeIcon />} href="/">
              Spriggle
          </Button>
          <TopNavMenuButton />
        </Box>
        <Box sx={{display: 'flex', gap: 2 }}>
          {user ? <IconButton href="/admin"> <AdminPanelSettingsIcon /> </IconButton> : null}
          <Box>
            {user ? <SignOutButton /> : <SignInButtons />}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}