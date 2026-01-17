"use client";

import { Box, Container, Typography } from "@mui/material";
import Footer from "./footer";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #9966FF 0%, #7A52CC 100%)",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: "white",
              textAlign: "center",
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            {title}
          </Typography>
          {lastUpdated && (
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                textAlign: "center",
                mt: 2,
              }}
            >
              Last updated: {lastUpdated}
            </Typography>
          )}
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.default" }}>
        <Container maxWidth="md">
          <Box
            sx={{
              "& h2": {
                fontSize: "1.5rem",
                fontWeight: 600,
                mt: 4,
                mb: 2,
                color: "text.primary",
              },
              "& h3": {
                fontSize: "1.25rem",
                fontWeight: 600,
                mt: 3,
                mb: 1.5,
                color: "text.primary",
              },
              "& p": {
                mb: 2,
                lineHeight: 1.7,
                color: "text.secondary",
              },
              "& ul, & ol": {
                mb: 2,
                pl: 3,
                color: "text.secondary",
              },
              "& li": {
                mb: 1,
                lineHeight: 1.6,
              },
              "& a": {
                color: "#9966FF",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              },
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
