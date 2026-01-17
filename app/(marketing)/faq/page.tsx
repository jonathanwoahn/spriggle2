"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: "Getting Started",
    items: [
      {
        question: "What is Spriggle?",
        answer:
          "Spriggle is an AI-powered audiobook platform that brings beloved childhood classics to life with natural, expressive narration. We source content from publishers and use advanced AI voice technology to create immersive listening experiences.",
      },
      {
        question: "How do I create an account?",
        answer:
          "Simply click the 'Sign Up' button and enter your email address to create a free account. You'll be able to start exploring our library right away.",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes! You can create a free account and access a selection of stories at no cost. This lets you experience Spriggle before committing to a subscription.",
      },
      {
        question: "What devices can I use?",
        answer:
          "Spriggle works on any device with a modern web browser, including smartphones, tablets, laptops, and desktop computers. We're working on dedicated apps for iOS and Android.",
      },
    ],
  },
  {
    title: "Listening & Playback",
    items: [
      {
        question: "How do I find books?",
        answer:
          "You can browse our library by category, search for specific titles, or explore our curated collections on the homepage. Each book includes a description and audio preview.",
      },
      {
        question: "Can I download for offline listening?",
        answer:
          "Yes, premium subscribers can download audiobooks for offline listening. This is perfect for travel or areas with limited internet connectivity.",
      },
      {
        question: "How do bookmarks work?",
        answer:
          "Your listening progress is automatically saved, so you can pick up right where you left off. You can also manually bookmark favorite passages to return to later.",
      },
      {
        question: "Can I adjust playback speed?",
        answer:
          "Yes, you can adjust the playback speed from 0.5x to 2x, allowing you to listen at your preferred pace.",
      },
    ],
  },
  {
    title: "Account & Billing",
    items: [
      {
        question: "How do I manage my subscription?",
        answer:
          "You can manage your subscription from your account settings. There you can view your current plan, update payment methods, or change your subscription level.",
      },
      {
        question: "Can I share with family members?",
        answer:
          "Yes! Our family plan allows up to 4 family members to have their own profiles with separate bookmarks and listening history.",
      },
      {
        question: "How do I cancel?",
        answer:
          "You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely.",
      },
    ],
  },
  {
    title: "Content & Library",
    items: [
      {
        question: "How are books selected?",
        answer:
          "We carefully curate our library to include beloved classics that have stood the test of time. We work with publishers to bring you high-quality content that's appropriate for all ages.",
      },
      {
        question: "How does the AI narration work?",
        answer:
          "We use advanced AI voice technology to create natural, expressive narration. Our AI narrators are designed to bring characters to life with appropriate emotion and pacing, creating an immersive listening experience.",
      },
      {
        question: "Can I request specific books?",
        answer:
          "We love hearing from our community! You can submit book requests through our contact form, and we'll consider them for future additions to our library.",
      },
      {
        question: "Are new books added regularly?",
        answer:
          "Yes, we regularly add new titles to our library. Follow us on social media or check back often to discover new additions.",
      },
    ],
  },
  {
    title: "Technical Issues",
    items: [
      {
        question: "The audio won't play - what should I do?",
        answer:
          "First, check your internet connection and try refreshing the page. If the issue persists, try clearing your browser cache or using a different browser. If you're still having trouble, please contact our support team.",
      },
      {
        question: "How do I report a problem?",
        answer:
          "You can report issues through our contact form or email us at support@spriggle.com. Please include as much detail as possible about the problem you're experiencing.",
      },
      {
        question: "Which browsers are supported?",
        answer:
          "Spriggle works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.",
      },
    ],
  },
];

export default function FAQPage() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #9966FF 0%, #FF8866 100%)",
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              color: "white",
              textAlign: "center",
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              textAlign: "center",
              fontWeight: 400,
            }}
          >
            Find answers to common questions about Spriggle
          </Typography>
        </Container>
      </Box>

      {/* FAQ Content */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
        <Container maxWidth="md">
          {faqData.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  mb: 3,
                  color: "text.primary",
                  fontWeight: 600,
                }}
              >
                {category.title}
              </Typography>

              {category.items.map((item, itemIndex) => {
                const panelId = `${categoryIndex}-${itemIndex}`;
                return (
                  <Accordion
                    key={itemIndex}
                    expanded={expanded === panelId}
                    onChange={handleChange(panelId)}
                    elevation={0}
                    sx={{
                      mb: 1,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      "&:before": { display: "none" },
                      "&.Mui-expanded": {
                        margin: 0,
                        mb: 1,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#9966FF" }} />}
                      sx={{
                        px: 3,
                        py: 1,
                        "& .MuiAccordionSummary-content": {
                          my: 2,
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color:
                            expanded === panelId
                              ? "#9966FF"
                              : "text.primary",
                        }}
                      >
                        {item.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "text.secondary",
                          lineHeight: 1.7,
                        }}
                      >
                        {item.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          ))}

          {/* Contact CTA */}
          <Box
            sx={{
              mt: 8,
              p: 4,
              bgcolor: "background.paper",
              borderRadius: 4,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Still have questions?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              We're here to help. Reach out to our support team.
            </Typography>
            <Typography
              component="a"
              href="mailto:contact@cashmerepublishing.com"
              sx={{
                color: "#9966FF",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              contact@cashmerepublishing.com
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
