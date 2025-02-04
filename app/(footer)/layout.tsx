import Footer from "@/components/footer/footer";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

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
