'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material';
import { usePathname } from 'next/navigation';
import theme from '@/app/theme';
import { MenuProvider } from '@/context/admin-menu-context';
import { AccentColorProvider } from '@/context/accent-color-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSetupRoute = pathname?.startsWith('/setup');

  // During setup, skip SessionProvider to avoid auth API calls
  // when database isn't configured yet
  if (isSetupRoute) {
    return (
      <ThemeProvider theme={theme}>
        <AccentColorProvider>
          <MenuProvider>
            {children}
          </MenuProvider>
        </AccentColorProvider>
      </ThemeProvider>
    );
  }

  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <AccentColorProvider>
          <MenuProvider>
            {children}
          </MenuProvider>
        </AccentColorProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
