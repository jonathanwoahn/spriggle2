'use client';
import { Box, ButtonBase, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export interface IBookCarousel {
  dots?: boolean;
  infinite?: boolean;
  speed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
}

const defaultProps: IBookCarousel = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 6,
  slidesToScroll: 1,
};

export default function BookCarousel({...props}: IBookCarousel) {
  const settings = {
    ...defaultProps,
    ...props,
    // dots: true,
    // infinite: true,
    // speed: 500,
    // slidesToShow: 6,
    // slidesToScroll: 1,
  };

  var items = [
    {
      "title": "The Boxcar Children",
      "author": "Gertrude Chandler Warner"
    },
    {
      "title": "Magic Tree House: Dinosaurs Before Dark",
      "author": "Mary Pope Osborne"
    },
    {
      "title": "The Adventures of Tom Sawyer",
      "author": "Mark Twain"
    },
    {
      "title": "Charlotte's Web",
      "author": "E.B. White"
    },
    {
      "title": "Anne of Green Gables",
      "author": "L.M. Montgomery"
    },
    {
      "title": "Little House on the Prairie",
      "author": "Laura Ingalls Wilder"
    },
    {
      "title": "Harry Potter and the Sorcerer's Stone",
      "author": "J.K. Rowling"
    },
    {
      "title": "The Chronicles of Narnia: The Lion, the Witch, and the Wardrobe",
      "author": "C.S. Lewis"
    },
    {
      "title": "Percy Jackson & the Olympians: The Lightning Thief",
      "author": "Rick Riordan"
    },
    {
      "title": "The Secret Garden",
      "author": "Frances Hodgson Burnett"
    }
  ];

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Popular Books</Typography>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        pl: '48px',
        pr: '48px',
        pb: '32px',
      }}>
          <Box sx={{ width: '100%' }}>
            <Slider {...settings}>
              {items.map((item, idx) => (
                <Box component="div" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }} key={idx}>
                  <ButtonBase
                    href="/book"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '200px',
                      ml: 'auto',
                      mr: 'auto',
                      p: 2,
                      gap: 2,
                    }}>
                    <Box sx={{ height: 240, width: '100%', bgcolor: 'gray', borderRadius: 2 }} />
                    <Box
                      component="div"
                      sx={{
                        display: 'block',
                        width: '100%',
                      }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}>{item.title}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>{item.author}</Typography>
                    </Box>
                  </ButtonBase>

                </Box>
              ))}
            </Slider>

          </Box>

        </Box>
      </>
  )
}