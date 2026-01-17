"use client";

import { Box, Container, Typography } from "@mui/material";
import BookCarousel from "@/components/book-carousel";

export default function CollectionsSection() {
  return (
    <Box
      id="collections"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            textAlign: "center",
            mb: 2,
          }}
        >
          Stories They'll Love, In Your Voice
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "text.secondary",
            mb: 6,
            maxWidth: 500,
            mx: "auto",
          }}
        >
          Choose from hundreds of children's favorites, all ready to be read in your voice
        </Typography>

        <Box sx={{ mt: 4 }}>
          <BookCarousel />
        </Box>
      </Container>
    </Box>
  );
}
