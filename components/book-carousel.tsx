'use client';
import { Box, ButtonBase, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { BOOKS } from "@/utils/constants";
import BookCoverImage from "./book-cover-image";

export interface IBookCarousel {
  dots?: boolean;
  infinite?: boolean;
  speed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  responsive?: {
    breakpoint: number;
    settings: Partial<IBookCarousel>;
  }[];
};

const defaultProps: IBookCarousel = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 6,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 2100,
      settings: {
        slidesToShow: 9,
      },
    },
    {
      breakpoint: 1900,
      settings: {
        slidesToShow: 8,
      },
    },
    {
      breakpoint: 1700,
      settings: {
        slidesToShow: 7,
      },
    },
    {
      breakpoint: 1500,
      settings: {
        slidesToShow: 6,
      },
    },
    {
      breakpoint: 1300,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 1100,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 900,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 700,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 500,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default function BookCarousel({...props}: IBookCarousel) {
  const settings = {
    ...defaultProps,
    ...props,
  };

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
            {BOOKS.map((item, idx) => (
                <Box component="div" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }} key={idx}>
                  <ButtonBase
                    href={"/book/" + item.book_uuid}
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
                    <BookCoverImage bookId={item.book_uuid} />
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