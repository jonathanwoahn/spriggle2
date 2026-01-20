import { db } from '@/db';
import { omnipubs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractColorsForBook, CoverColors, addAlphaToHex } from '@/lib/extract-colors';

interface BookLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

interface BookColorsResult {
  accentColors: { primary: string; secondary: string };
  coverColors: CoverColors | null;
}

async function getBookColors(bookId: string): Promise<BookColorsResult> {
  try {
    // Check if book exists and has cached colors
    const existingBook = await db
      .select({ coverColors: omnipubs.coverColors })
      .from(omnipubs)
      .where(eq(omnipubs.uuid, bookId))
      .limit(1);

    let colors: CoverColors | null = null;

    if (existingBook.length > 0 && existingBook[0].coverColors) {
      colors = existingBook[0].coverColors as CoverColors;
    } else if (existingBook.length > 0) {
      // Extract colors if not cached
      colors = await extractColorsForBook(bookId);

      // Save to database for future requests
      await db
        .update(omnipubs)
        .set({
          coverColors: colors,
          updatedAt: new Date(),
        })
        .where(eq(omnipubs.uuid, bookId));
    }

    if (colors) {
      // Add 85% opacity for navbar
      const primary = colors.primary.startsWith('#')
        ? addAlphaToHex(colors.primary, 0.85)
        : colors.primary;
      const secondary = colors.secondary.startsWith('#')
        ? addAlphaToHex(colors.secondary, 0.85)
        : colors.secondary;

      return { accentColors: { primary, secondary }, coverColors: colors };
    }
  } catch (error) {
    console.error('Failed to get book colors:', error);
  }

  return {
    accentColors: {
      primary: 'rgba(153, 102, 255, 0.85)',
      secondary: 'rgba(122, 82, 204, 0.85)'
    },
    coverColors: null
  };
}

export default async function BookLayout({ children, params }: BookLayoutProps) {
  const { id } = await params;
  const { accentColors, coverColors } = await getBookColors(id);

  // Inject CSS custom properties for navbar colors
  // This allows the navbar (rendered in root layout) to read book-specific colors
  const cssVars = `
    :root {
      --accent-primary: ${accentColors.primary};
      --accent-secondary: ${accentColors.secondary};
      --cover-dark-vibrant: ${coverColors?.darkVibrant || '#9966FF'};
      --cover-vibrant: ${coverColors?.vibrant || '#9966FF'};
      --cover-muted: ${coverColors?.muted || '#FF8866'};
      --cover-light-muted: ${coverColors?.lightMuted || '#FF8866'};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {children}
    </>
  );
}
