import Footer from "@/components/footer/footer";
import { Box } from "@mui/material";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      {children}
      <Footer />
    </Box>
  );
}
