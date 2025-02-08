import { Geist } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/top-nav/top-nav";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { MenuProvider } from "@/context/admin-menu-context";
import RegisterServiceWorker from "@/components/book-ingestion/register-service-worker";
import { createClient, isAdmin } from "@/utils/supabase/server";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const admin = await isAdmin();
  
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <Box component="body" sx={{height: '100vh'}}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {admin && <RegisterServiceWorker />}
          <MenuProvider>
            <Box component="main" sx={{height: '100vh'}} >
              <TopNav />
              <Box sx={{height: 'calc(100vh - 64px)'}}>
                {children}
              </Box>
            </Box>
          </MenuProvider>
        </ThemeProvider>
      </Box>
    </html>
  );
}
