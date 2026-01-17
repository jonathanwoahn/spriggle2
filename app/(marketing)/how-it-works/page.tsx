"use client";

import {
  Box,
  Button,
  Container,
  Grid2 as Grid,
  Paper,
  Typography,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";

const steps = [
  {
    number: 1,
    icon: MenuBookIcon,
    title: "Browse Our Library",
    description:
      "Explore our curated collection of beloved classics. From adventure tales to bedtime stories, find the books that shaped your childhood.",
    color: "#9966FF",
  },
  {
    number: 2,
    icon: RecordVoiceOverIcon,
    title: "Choose Your Experience",
    description:
      "Select from a variety of AI narrators, each bringing their own warmth and character to the story. Preview voices before you commit.",
    color: "#FF8866",
  },
  {
    number: 3,
    icon: PlayCircleIcon,
    title: "Listen & Enjoy",
    description:
      "Stream anywhere, anytime. Bookmark your favorite moments, pick up where you left off, and share the magic with family.",
    color: "#66FFE0",
  },
];

const features = [
  {
    icon: LibraryBooksIcon,
    title: "Classics You Know and Love",
    description:
      "Every book in our library is carefully selected for quality and nostalgia.",
    color: "#9966FF",
  },
  {
    icon: BookmarkIcon,
    title: "Never Lose Your Place",
    description: "Automatically saves your spot across all devices.",
    color: "#FF8866",
  },
  {
    icon: CloudDownloadIcon,
    title: "Stories On The Go",
    description: "Download for offline listening during travel or quiet time.",
    color: "#66FFE0",
  },
  {
    icon: FamilyRestroomIcon,
    title: "Share the Magic",
    description:
      "Create family accounts so everyone can have their own bookmarks.",
    color: "#FFEB66",
  },
];

export default function HowItWorksPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #9966FF 0%, #FF8866 100%)",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              color: "white",
              textAlign: "center",
              mb: 3,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Your Favorite Stories, Reimagined
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              fontWeight: 400,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            See how Spriggle brings childhood classics to life with AI-powered
            narration
          </Typography>
        </Container>
      </Box>

      {/* Steps Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: "center",
              mb: 8,
            }}
          >
            How It Works
          </Typography>

          <Grid container spacing={6}>
            {steps.map((step, index) => (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: "background.paper",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 12px 40px ${step.color}20`,
                    },
                  }}
                >
                  {/* Step number badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      left: 24,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: step.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 14px ${step.color}50`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      {step.number}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        bgcolor: `${step.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      <step.icon sx={{ fontSize: 40, color: step.color }} />
                    </Box>

                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {step.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", lineHeight: 1.7 }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              textAlign: "center",
              mb: 2,
            }}
          >
            Features You'll Love
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 8,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            Everything you need for the perfect listening experience
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: `${feature.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <feature.icon sx={{ fontSize: 32, color: feature.color }} />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: "linear-gradient(135deg, #9966FF 0%, #5C3D99 100%)",
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ color: "white", mb: 3 }}
            >
              Ready to Start Listening?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.85)",
                mb: 4,
                fontWeight: 400,
              }}
            >
              Join Spriggle today and rediscover the magic of storytelling.
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
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Create Free Account
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
