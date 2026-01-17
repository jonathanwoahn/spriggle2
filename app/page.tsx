import Footer from "@/components/footer/footer";
import Hero from "@/components/hero";
import {
  ValueProps,
  QuoteSection,
  CTASection,
  CollectionsSection,
} from "@/components/home";
import { Box } from "@mui/material";

export default async function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Hero />

      {/* Value Propositions */}
      <ValueProps />

      {/* Book Collections */}
      <CollectionsSection />

      {/* Quote / Testimonial */}
      <QuoteSection />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </Box>
  );
}
