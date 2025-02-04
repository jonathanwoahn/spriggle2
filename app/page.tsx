import BookCarousel from "@/components/book-carousel";
import Footer from "@/components/footer/footer";
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
          pl: 2,
          pr: 2,
        }}>
        <BookCarousel collectionId={3} />
        {/* <BookCarousel collectionId={1} />
        <BookCarousel collectionId={2} /> */}
      </Box>
      <Footer />
    </Box>
  );
}
