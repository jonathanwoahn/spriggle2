import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";
import Image from "next/image";

export default function Hero() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      pt: 8,
      pb: 8,
    }}>
      <Grid container spacing={8} sx={{width: '100%'}}>
        <Grid
          size={{xs: 12, md: 6}}
          sx={{order: {xs: 2, md: 1}}}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            justifyContent: 'center',
            height: {md: '50vh'},
          }}>
            <Box sx={{display: 'flex', gap: 4, flexDirection: 'column'}}>
              <Box sx={{display: 'flex', flexDirection: 'column', }}>
                <Typography variant="h1" component="h1" sx={{textAlign: {xs: 'center', md: 'right',}}}>
                  Headline
                </Typography>
                <Typography variant="body1" component="p" sx={{ textAlign: { xs: 'center', md: 'right' } } }>
                  Body text below the headline
                </Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'center', }}>
                <Button variant="contained" size="large" href="/sign-up">
                  Sign Up
                </Button>
              </Box>
              </Box>
          </Box>

        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'purple',
            height: { xs: '40vh', md: '50vh' },
            position: 'relative',
          }}>
            <Image priority={true} src="https://picsum.photos/600/400" alt="" objectFit="cover" fill={true} sizes="100vh" />
          </Box>
        </Grid>
      </Grid>

    </Box>
    
  );
}
