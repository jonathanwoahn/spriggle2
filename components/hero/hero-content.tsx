"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { useSession } from "next-auth/react";

export function HeroContent() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  return (
    <Container
      maxWidth="lg"
      sx={{
        position: "relative",
        zIndex: 10,
        py: { xs: 4, md: 6 },
        // On mobile, position text at bottom
        display: "flex",
        flexDirection: "column",
        justifyContent: { xs: "flex-end", md: "center" },
        minHeight: { xs: "100vh", md: "auto" },
        pb: { xs: 6, md: 6 },
        pt: { xs: "55vh", md: 6 }, // Leave room for books on mobile
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", md: "flex-start" },
          maxWidth: { md: "50%" },
          gap: 3,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: "white",
            textAlign: { xs: "center", md: "left" },
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            textShadow: "0 2px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          Read to Your Kids, Even When You Can't Be There
        </Typography>

        <Typography
          variant="h6"
          component="p"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: { xs: "center", md: "left" },
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: 500,
          }}
        >
          Record your voice once, and let your children hear you read their
          favorite stories anytime. Bedtime, car rides, or whenever they miss you.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            mt: 2,
          }}
        >
          {!isLoggedIn && (
            <Button
              variant="contained"
              size="large"
              href="/sign-up"
              sx={{
                bgcolor: "white",
                color: "#9966FF",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  transform: "translateY(-2px) scale(1.02)",
                  boxShadow: "0 6px 24px rgba(0, 0, 0, 0.2)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Record Your Voice
            </Button>
          )}

          <Button
            variant={isLoggedIn ? "contained" : "outlined"}
            size="large"
            href="#collections"
            sx={{
              color: isLoggedIn ? "#9966FF" : "white",
              bgcolor: isLoggedIn ? "white" : "transparent",
              borderColor: "rgba(255, 255, 255, 0.5)",
              borderWidth: 2,
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: isLoggedIn ? "0 4px 20px rgba(0, 0, 0, 0.15)" : "none",
              "&:hover": {
                borderColor: "white",
                bgcolor: isLoggedIn ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.1)",
                borderWidth: 2,
                transform: "translateY(-2px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Browse Library
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
