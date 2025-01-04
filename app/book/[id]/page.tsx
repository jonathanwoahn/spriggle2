import BookCarousel from "@/components/book-carousel";
import { AppBar, Box, Button, Chip, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrow";
import Footer from "@/components/footer";
import { Grid2 as Grid } from '@mui/material';
import ChaptersButton from "./chapters-button";
import { BOOKS } from "@/utils/constants";
import Image from "next/image";
import { IBookData } from "./play/media-player";


export default async function BookPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  const url = `http://localhost:3000/api/book/${id}`;
  const response = await fetch(url);
  const bookData: IBookData = await response.json();
  console.log(bookData);
  
  if (!bookData) {
    return <div>Book not found</div>;
  }  

  const labels = [
    "Friendship",
    "Animal Stories",
    "Classic Children's Literature",
    "Farm Life",
    "Selflessness and Sacrifice",
  ];
  
  return (
    <>
      <Box sx={{ width: '100%', maxWidth: '840px', marginLeft: 'auto', marginRight: 'auto', }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', p: 2, pt: 8, }}>
          <Grid container sx={{width: '100%'}}>
            <Grid size={{xs: 12, md: 7}}>
              <Grid container>
                <Grid size={{xs: 12, md: 5}}>
                  <Box sx={{display: 'flex', justifyContent: 'center', }}>
                    <Box sx={{borderRadius: 2, overflow: 'hidden'}}>
                      <Image src={`/api/book/${bookData.uuid}/cover`} alt={bookData.data.title} height={300} width={225} />
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{xs: 12, md: 7}}>
                  <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 1, p: {xs: 0, md: 2}, pt: {xs: 4},}}>
                    <Typography variant="h5" component="h5">{bookData.data.title}</Typography>
                    <Typography variant="body2" component="p">By {bookData.data.creators.join(', ')}</Typography>
                    <Typography variant="body2" component="p">Length of audiobook</Typography>

                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{xs: 12, md: 5}}>
              <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 2, pt: 2, pb: 2, }}>
                <Button startIcon={<PlayIcon />} variant="contained" href={`/book/${id}/play`}>Play</Button>
                <ChaptersButton bookData={bookData} />
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, }}>
          <Typography variant="h4" component="h4">Summary</Typography>
          <Typography variant="body1" component="p">
            “Charlotte’s Web” is a timeless classic that tells the heartwarming story of a young pig named Wilbur and his unlikely friendship with Charlotte, a wise and gentle spider. When Wilbur is faced with the grim prospect of being slaughtered, Charlotte devises a plan to save his life. She spins extraordinary webs with words like “Some Pig” and “Terrific,” turning Wilbur into a local celebrity and ensuring his safety.
          </Typography>
          <Typography variant="body1" component="p">
            Set on a small farm, the story explores themes of friendship, loyalty, and the cycle of life. With its richly drawn characters, including Fern, the compassionate girl who first saves Wilbur, and the lovable but self-centered rat, Templeton, Charlotte’s Web is a poignant tale that has touched the hearts of generations.
          </Typography>
          <Typography variant="h5" component="h5">
            Key Highlights
          </Typography>
          <Box component="ul" sx={{ display: 'flex', gap: 1, flexDirection: 'column', }}>
            <Typography variant="body1" component="li">
              A beloved story about the power of friendship and selflessness.
            </Typography>
            <Typography variant="body1" component="li">
              Beautifully illustrated by Garth Williams, adding charm to the narrative.
            </Typography>
            <Typography variant="body1" component="li">
              Winner of the Newbery Honor and other literary accolades.
            </Typography>
            <Typography variant="body1" component="li">
              Frequently included in school curriculums as a classic work of children’s literature.
            </Typography>
          </Box>
          <Typography variant="h5" component="h5">
            Why It's Special
          </Typography>
          <Typography variant="body1" component="p">
            Charlotte’s Web is a masterful blend of humor, heart, and profound life lessons, making it a must-read for children and adults alike. Its enduring appeal lies in its ability to tackle deep themes in a way that is accessible to young readers.
          </Typography>
          <Typography variant="body1" component="p">
            This story is a celebration of the extraordinary found in the ordinary, reminding readers of the beauty of kindness and the importance of standing up for those we care about.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            p: 2,
            overflowX: 'scroll',
            overflow: 'hidden',
            gap: 1,
          }}>
          {labels.map((label, idx) => (
            <Chip label={label} key={idx}></Chip>
          ))}
        </Box>
        <Box sx={{ p: 2 }}>
          <BookCarousel slidesToShow={2} />

        </Box>
      </Box>
      <Footer />
    </>
  );
}