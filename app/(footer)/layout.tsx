import Footer from "@/components/footer";
import { Box } from "@mui/material";

export default async function FooterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Box component="div">
        {children}
      </Box>
      <Footer />
    </>
  );
}
