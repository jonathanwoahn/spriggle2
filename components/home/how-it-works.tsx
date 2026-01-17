"use client";

import { Box, Container, Grid2 as Grid, Typography } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

const steps = [
  {
    number: 1,
    icon: MenuBookIcon,
    title: "Choose a Story",
    description: "Browse our curated collection of childhood classics.",
    color: "#9966FF",
  },
  {
    number: 2,
    icon: RecordVoiceOverIcon,
    title: "Pick Your Narrator",
    description: "Select from AI voices perfectly suited to each tale.",
    color: "#FF8866",
  },
  {
    number: 3,
    icon: PlayCircleIcon,
    title: "Start Listening",
    description: "Press play and let the story begin.",
    color: "#66FFE0",
  },
];

export default function HowItWorks() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "background.paper",
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
          How It Works
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
          Getting started with Spriggle is simple
        </Typography>

        <Grid container spacing={4} alignItems="flex-start">
          {steps.map((step, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                {/* Step number */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: step.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    boxShadow: `0 4px 14px ${step.color}40`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {step.number}
                  </Typography>
                </Box>

                {/* Icon */}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    bgcolor: `${step.color}10`,
                    border: `2px solid ${step.color}30`,
                  }}
                >
                  <step.icon
                    sx={{
                      fontSize: 48,
                      color: step.color,
                    }}
                  />
                </Box>

                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    maxWidth: 250,
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </Typography>

                {/* Connector line (hidden on mobile, shown between items) */}
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      display: { xs: "none", md: "block" },
                      position: "absolute",
                      top: 20,
                      right: -60,
                      width: 120,
                      height: 2,
                      background: `linear-gradient(90deg, ${step.color} 0%, ${steps[index + 1].color} 100%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
