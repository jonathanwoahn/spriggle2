import { Inter } from "next/font/google";
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Box, CssBaseline } from "@mui/material";
import Providers from "@/components/providers";
import TopNav from "@/components/top-nav/top-nav";
import { isDatabaseConfigured } from "@/db";
import { isSetupComplete } from "@/lib/setup";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Spriggle - Where Childhood Favorites Find New Voices",
  description: "Rediscover your favorite childhood classics, now as audiobooks with AI-powered narration that brings every character to life.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if we should show full layout with nav
  const dbConfigured = isDatabaseConfigured();
  let showNav = false;

  if (dbConfigured) {
    try {
      const setupComplete = await isSetupComplete();
      if (setupComplete) {
        showNav = true;
      }
    } catch {
      // Setup not complete or error - don't show nav
      showNav = false;
    }
  }

  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body style={{ minHeight: '100vh' }} className="font-body">
        <Providers>
          <CssBaseline />
          <Box component="main" sx={{ minHeight: '100vh' }}>
            {showNav && <TopNav />}
            <Box sx={{ minHeight: showNav ? 'calc(100vh - 64px)' : '100vh' }}>
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
