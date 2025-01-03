import { Box } from "@mui/material";
import Link from "next/link";


export default function Footer() {
  return (
    <Box component="footer" sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', pt: 16, pb: 16,bgcolor: 'rgba(0,0,0,0.9)', color: 'white'}}>
      <Box sx={{ width: '100%', maxWidth: '840px', display: 'flex', flexDirection: 'column'}}>
        <Box>
          <Box>
            Spriggle Logo
          </Box>
          <ul>
            <li>
              <Link href="/about-us">About Us</Link>
            </li>
            <li>
              <Link href="/for-publishers">For Publishers</Link>
            </li>
            <li>
              <Link href="/contact-us">Contact Us</Link>
            </li>
          </ul>
        </Box>
        <Box sx={{bgcolor: 'rgba(255,255,255,0.15)', width: '100%', height: '1px', mt: 2, mb: 2}}></Box>
        <Box sx={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
          <Box>
            Copyright {new Date().getFullYear()}
          </Box>
          <Box>
            <Link href="/terms-of-use">Terms of Use</Link>
          </Box>
          <Box>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}