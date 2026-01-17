"use client";

import { Box, Container, Grid2 as Grid, Typography } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

const features = [
  {
    icon: MicIcon,
    title: "Record Once",
    description:
      "A quick voice recording is all it takes. Our technology learns your unique voice and speaking style.",
    color: "#9966FF",
  },
  {
    icon: FavoriteIcon,
    title: "Your Voice, Their Comfort",
    description:
      "Children hear you read to them, even during business trips, deployments, or late work nights.",
    color: "#FF8866",
  },
  {
    icon: AutoStoriesIcon,
    title: "Growing Library",
    description:
      "Hundreds of beloved children's books, from classic tales to modern favorites, all in your voice.",
    color: "#66FFE0",
  },
];

export default function ValueProps() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  p: 4,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    bgcolor: `${feature.color}15`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                      bgcolor: `${feature.color}25`,
                    },
                  }}
                >
                  <feature.icon
                    sx={{
                      fontSize: 40,
                      color: feature.color,
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    maxWidth: 300,
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
