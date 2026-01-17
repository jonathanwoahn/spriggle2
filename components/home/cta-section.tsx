"use client";

import { Box, Button, Container, Typography } from "@mui/material";

export default function CTASection() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(135deg, #9966FF 0%, #5C3D99 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          left: "10%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
        }}
      />

      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: "white",
              mb: 3,
              textShadow: "0 2px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            Be There for Every Bedtime Story
          </Typography>

          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "rgba(255, 255, 255, 0.85)",
              mb: 5,
              maxWidth: 500,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Give your children the gift of your voice, no matter where life takes you.
          </Typography>

          <Button
            variant="contained"
            size="large"
            href="/sign-up"
            sx={{
              bgcolor: "white",
              color: "#9966FF",
              px: 5,
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.95)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.25)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Start Recording Free
          </Button>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              mt: 3,
            }}
          >
            Record your voice in minutes. No credit card required.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
