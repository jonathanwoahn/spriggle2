"use client";

import { Box, Container, Grid2 as Grid, Link, Typography } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

const footerLinks = {
  discover: [
    { label: "Browse Library", href: "/#collections" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  support: [
    { label: "Help / FAQ", href: "/faq" },
    { label: "Contact", href: "mailto:contact@cashmerepublishing.com" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Use", href: "/terms-of-use" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
};

interface FooterColumnProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          color: "rgba(255, 255, 255, 0.6)",
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: "0.75rem",
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            underline="hover"
            sx={{
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "0.9rem",
              transition: "color 0.2s",
              "&:hover": {
                color: "#C2A3FF",
              },
            }}
          >
            {link.label}
          </Link>
        ))}
      </Box>
    </Box>
  );
}

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1A1625",
        color: "white",
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Logo and Links Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Logo Column */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AutoStoriesIcon sx={{ fontSize: 32, color: "#9966FF" }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "white",
                }}
              >
                Spriggle
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.6,
                maxWidth: 250,
              }}
            >
              Where childhood favorites find new voices.
            </Typography>
          </Grid>

          {/* Discover Column */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <FooterColumn title="Discover" links={footerLinks.discover} />
          </Grid>

          {/* Support Column */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <FooterColumn title="Support" links={footerLinks.support} />
          </Grid>

          {/* Legal Column */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <FooterColumn title="Legal" links={footerLinks.legal} />
          </Grid>
        </Grid>

        {/* Divider */}
        <Box
          sx={{
            height: 1,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            mb: 4,
          }}
        />

        {/* Bottom Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", sm: "flex-start" },
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            &copy; {new Date().getFullYear()} Spriggle. All rights reserved.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
            }}
          >
            {/* Social icons could go here */}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
