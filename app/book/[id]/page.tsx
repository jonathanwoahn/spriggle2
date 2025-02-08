import BookCarousel, { IBookCarousel } from "@/components/book-carousel";
import { Box, Button, Typography } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrow";
import Footer from "@/components/footer/footer";
import { Grid2 as Grid } from '@mui/material';
import ChaptersButton from "./chapters-button";
import BookCoverImage from "@/components/book-cover-image";
import BookCollectionChips from "./book-collection-chips";
import MuiMarkdown from "mui-markdown";
import { formatDuration2 } from "@/lib/utils";
import BookIngestionStatus from "@/components/book-ingestion/book-ingestion-status";
import { IBlockMetadata, IBookData } from "@/lib/types";
import { createClient, isAdmin } from "@/utils/supabase/server";

export default async function BookPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const url = `${defaultUrl}/api/book/${id}`;
  const response = await fetch(url);
  const bookData: IBookData = await response.json();
  
  if (!bookData) {
    return <div>Book not found</div>;
  }  

  const admin = await isAdmin();
  
  const blockResponse = await fetch(`${defaultUrl}/api/metadata?bookId=${bookData.uuid}&type=book`);
  const {data} = (await blockResponse.json());
  const blockData: IBlockMetadata = data[0];

  const carouselSettings: Partial<IBookCarousel> = {
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 750,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };
  return (
    <>
      <Box sx={{ width: '100%', maxWidth: '840px', marginLeft: 'auto', marginRight: 'auto', }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', p: 2, pt: 8, }}>
          <Grid container sx={{width: '100%'}}>
            <Grid size={{xs: 12, md: 8}}>
              <Grid container>
                <Grid size={{xs: 12, md: 5}}>
                  <Box sx={{display: 'flex', justifyContent: 'center', }}>
                    <BookCoverImage bookId={bookData.uuid} />
                  </Box>
                </Grid>
                <Grid size={{xs: 12, md: 7}}>
                  <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 1, p: {xs: 0, md: 2}, pt: {xs: 4},}}>
                    <Typography variant="h5" component="h5">{bookData?.data.title}</Typography>
                    <Typography variant="body2" component="p">By {(bookData?.data.creators || []).join(', ')}</Typography>
                    <Typography variant="body2" component="p">{(!!blockData && 'duration' in blockData.data && blockData.data.duration) ? formatDuration2((blockData?.data.duration || 0) / 1000) : null}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{xs: 12, md: 4}}>
              <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 2, pt: 2, pb: 2, }}>
                <Button
                  disabled={!blockData || !('ready' in blockData.data) || !blockData.data.ready}
                  startIcon={<PlayIcon />}
                  variant="contained"
                  href={`/book/${id}/play/0`}>
                    Play
                </Button>
                <ChaptersButton bookData={bookData} />
              </Box>
            </Grid>
          </Grid>
        </Box>
        {!!admin && <BookIngestionStatus bookId={id} />}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, }}>
          <MuiMarkdown
            overrides={{
              h3: {
                component: Typography,
                props: {
                  variant: 'h4',
                  sx: {
                    mb: 2,
                  },
                },
              },
              h4: {
                component: Typography,
                props: {
                  variant: 'h5',
                  sx: {
                    mb: 1,
                  },
                },
              },
              h5: {
                component: Typography,
                props: {
                  variant: 'h6',
                },
              },
              p: {
                component: Typography,
                props: {
                  variant: 'body1',
                  paragraph: true,
                },
              },
            }}
          >
            {'summary' in blockData.data ? blockData.data.summary : ''}
          </MuiMarkdown>
        </Box>
        <BookCollectionChips bookId={id} />
        <Box sx={{ p: 2 }}>
          <BookCarousel {...carouselSettings} bookId={id} />
        </Box>
      </Box>
      <Footer />
    </>
  );
}