import BookCarousel from "@/components/book-carousel";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import { Box } from "@mui/material";

export default async function Home() {
  return (
    <Box>
      <Hero />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pb: '108px',
        }}>
        <BookCarousel />
        <BookCarousel />
        <BookCarousel />
      </Box>
      <Footer />
    </Box>
  );
}
