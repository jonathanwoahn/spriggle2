import BookCarousel, { IBookCarousel } from "@/components/book-carousel";
import { Box, Typography } from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import Footer from "@/components/footer/footer";
import BookDetailHero from "@/components/book-detail-hero";
import BookCollectionChips from "./book-collection-chips";
import MuiMarkdown from "mui-markdown";
import { formatDuration2, getServerURL } from "@/lib/utils";
import BookIngestionStatus from "@/components/book-ingestion/book-ingestion-status";
import { IBlockMetadata } from "@/lib/types";
import { isAdmin } from "@/lib/auth";
import { CoverColors } from "@/lib/extract-colors";

export default async function BookPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  const admin = await isAdmin();

  // Fetch book metadata and colors in parallel
  const [blockResponse, colorsResponse] = await Promise.all([
    fetch(`${getServerURL()}/api/metadata?blockId=${id}&type=book`),
    fetch(`${getServerURL()}/api/book/${id}/extract-colors`),
  ]);

  const {data} = (await blockResponse.json());
  const blockData: IBlockMetadata = data?.[0];

  // Get colors (will be extracted on-demand if not cached)
  let coverColors: CoverColors | null = null;
  try {
    const colorsData = await colorsResponse.json();
    coverColors = colorsData.colors || null;
  } catch {
    // Colors extraction failed, will use client-side fallback
  }

  if (!blockData) {
    return (
      <Box sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #9966FF 0%, #FF8866 100%)',
      }}>
        <Typography variant="h5" sx={{ color: 'white' }}>Book not found</Typography>
      </Box>
    );
  }

  // Extract book info from local metadata
  const bookData = {
    uuid: blockData.bookId,
    data: blockData.data as any,
  };

  const bookMetaData = blockData.data as Record<string, unknown>;
  const duration = (bookMetaData.duration && typeof bookMetaData.duration === 'number')
    ? formatDuration2((bookMetaData.duration || 0) / 1000)
    : null;

  const isReady = blockData && bookMetaData.ready === true;
  const summary = typeof bookMetaData.summary === 'string' ? bookMetaData.summary : null;

  const carouselSettings: Partial<IBookCarousel> = {
    slidesToShow: 3,
    responsive: [
      { breakpoint: 550, settings: { slidesToShow: 1 } },
      { breakpoint: 750, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <>
      {/* Hero Section with Dynamic Gradient */}
      <BookDetailHero
        bookId={bookData.uuid}
        title={bookData.data.title}
        creators={bookData.data.creators}
        duration={duration}
        isReady={isReady}
        bookData={bookData}
        coverColors={coverColors}
      />

      {/* Admin Section */}
      {!!admin && (
        <Box sx={{ maxWidth: '900px', mx: 'auto', px: 2, py: 2 }}>
          <BookIngestionStatus bookId={id} />
        </Box>
      )}

      {/* Summary Section */}
      <Box
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          px: { xs: 3, md: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        {summary && (
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(153,102,255,0.05) 0%, rgba(255,136,102,0.05) 100%)',
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              border: '1px solid rgba(153,102,255,0.1)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#9966FF',
              }}
            >
              <MenuBookRoundedIcon /> About This Book
            </Typography>
            <MuiMarkdown
              overrides={{
                h3: {
                  component: Typography,
                  props: { variant: 'h5', sx: { mb: 2, fontWeight: 600 } },
                },
                h4: {
                  component: Typography,
                  props: { variant: 'h6', sx: { mb: 1, fontWeight: 600 } },
                },
                h5: {
                  component: Typography,
                  props: { variant: 'subtitle1', sx: { fontWeight: 600 } },
                },
                p: {
                  component: Typography,
                  props: { variant: 'body1', paragraph: true, sx: { lineHeight: 1.8 } },
                },
              }}
            >
              {summary}
            </MuiMarkdown>
          </Box>
        )}
      </Box>

      {/* Collections */}
      <Box sx={{ maxWidth: '900px', mx: 'auto', px: 2 }}>
        <BookCollectionChips bookId={id} />
      </Box>

      {/* Similar Books Carousel */}
      <Box
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          px: 2,
          py: 4,
        }}
      >
        <BookCarousel {...carouselSettings} bookId={id} />
      </Box>

      <Footer />
    </>
  );
}