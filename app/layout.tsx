// import DeployButton from "@/components/deploy-button";
// import { EnvVarWarning } from "@/components/env-var-warning";
// import HeaderAuth from "@/components/header-auth";
// import { ThemeSwitcher } from "@/components/theme-switcher";
// import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
// import { ThemeProvider } from "next-themes";
// import Link from "next/link";
import "./globals.css";
import TopNav from "@/components/top-nav";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import Footer from "@/components/footer";
import theme from "./theme";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Spriggle | AI Powered Audiobooks for Kids",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <Box component="body" sx={{height: '100vh'}}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box component="main" sx={{height: '100vh'}} >
            <TopNav />
            {/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href={"/"}>Next.js Supabase Starter</Link>
                  <div className="flex items-center gap-2">
                    <DeployButton />
                  </div>
                </div>
                {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
              </div>
            </nav> */}

            <Box sx={{height: 'calc(100vh - 64px)'}}>
              {children}
            </Box>
            
            {/* <div className="flex flex-col gap-20 max-w-5xl p-5">
              {children}
            </div> */}



            {/* <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              <p>
                Powered by{" "}
                <a
                  href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                  target="_blank"
                  className="font-bold hover:underline"
                  rel="noreferrer"
                >
                  Supabase
                </a>
              </p>
              <ThemeSwitcher />
            </footer> */}
          </Box>
        </ThemeProvider>
        {/* </ThemeProvider> */}
      </Box>
    </html>
  );
}
