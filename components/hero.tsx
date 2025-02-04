import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import Image from "next/image";

export default function Hero() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      pt: 4,
      pb: 4,
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
            <Box sx={{display: 'flex', gap: 4, flexDirection: 'column', pl: {xs: 0, md: '20%'}}}>
              <Box sx={{display: 'flex', flexDirection: 'column', }}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    textAlign: {xs: 'center', md: 'right',},
                    mb: 1,
                    fontSize: { xs: '3rem', md: '4rem', lg: '5rem' },
                  }}>
                  Audiobooks for Kids
                </Typography>
                <Typography variant="body1" component="p" sx={{ textAlign: { xs: 'center', md: 'right' }, mb: 1 } }>
                  Spriggle is an AI powered audiobook platform for kids. 
                </Typography>
                <Typography variant="body1" component="p" sx={{ textAlign: { xs: 'center', md: 'right' } } }>
                  We've taken all of our favorite books we listened to as kids, and converted
                  them in Audiobooks using AI voice engines.
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
            bgcolor: 'rgba(255,255,255,0.01)',
            height: { xs: '40vh', md: '50vh' },
            position: 'relative',
          }}>
            {/* <Image priority={true} src="https://picsum.photos/600/400" alt="" objectFit="cover" fill={true} sizes="100vh" /> */}
            <Image priority={true} src="/hero2.png" alt="" objectFit="contain" fill={true} sizes="100vh" />
          </Box>
        </Grid>
      </Grid>

    </Box>
    
  );
}
