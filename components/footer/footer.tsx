import { Box, Link } from "@mui/material";


export default function Footer() {
  return (
    <Box component="footer" sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', pt: 16, pb: 16,bgcolor: 'rgba(0,0,0,0.9)', color: 'white'}}>
      <Box sx={{ width: '100%', maxWidth: '840px', display: 'flex', flexDirection: 'column', p: 2}}>
        <Box>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <Box>
              Spriggle Logo
            </Box>
            <Link href="/about-us" underline="hover">About Us</Link>
            <Link href="/for-publishers" underline="hover">For Publishers</Link>
            <Link href="mailto:contact@cashmerepublishing.com" underline="hover">Contact Us</Link>
          </Box>
        </Box>
        <Box sx={{bgcolor: 'rgba(255,255,255,0.15)', width: '100%', height: '1px', mt: 2, mb: 2}}></Box>
        <Box sx={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
          <Box>
            Copyright {new Date().getFullYear()}
          </Box>
          <Box>
            <Link href="/terms-of-use" underline="hover">Terms of Use</Link>
          </Box>
          <Box>
            <Link href="/privacy-policy" underline="hover">Privacy Policy</Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}