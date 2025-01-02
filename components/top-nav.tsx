import { AppBar, Box, Button, IconButton, Toolbar } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "./sign-out-button";

const SignInButtons = () => (
  <>
    <Button color="primary" variant="contained">
      <Link href="/sign-up">Sign Up</Link>
    </Button>
    <Button color="secondary">
      <Link href="/sign-in">Sign In</Link>
    </Button>
  </>
);

export default async function TopNav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppBar position="static" color="transparent" sx={{zIndex: 10000}}>
      <Toolbar sx={{alignItems: 'center', justifyContent: 'space-between'}}>
        <Box>
          <Button color="info" startIcon={<HomeIcon />}>
            <Link href="/">
              Spriggle
            </Link>
          </Button>
        </Box>
        <Box sx={{display: 'flex', gap: 2 }}>
          <IconButton>
            <HomeIcon />
          </IconButton>
          <Box>
            {user ? <SignOutButton /> : <SignInButtons />}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}