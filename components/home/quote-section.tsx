"use client";

import { Box, Container, Typography } from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

export default function QuoteSection() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "5%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #9966FF10 0%, #FF886610 100%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #66FFE010 0%, #9966FF10 100%)",
        }}
      />

      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          <FormatQuoteIcon
            sx={{
              fontSize: 60,
              color: "#9966FF",
              opacity: 0.3,
              mb: 2,
              transform: "rotate(180deg)",
            }}
          />

          <Typography
            variant="h3"
            component="blockquote"
            sx={{
              fontStyle: "italic",
              fontWeight: 500,
              lineHeight: 1.5,
              mb: 4,
              maxWidth: 700,
              color: "text.primary",
            }}
          >
            "My daughter asks for 'Daddy stories' every night now. Even when I'm
            traveling, I'm still there for bedtime."
          </Typography>

          <Box
            sx={{
              width: 60,
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(90deg, #9966FF 0%, #FF8866 100%)",
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
