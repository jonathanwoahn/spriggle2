'use client';
import { Box, ButtonBase, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { BOOKS } from "@/utils/constants";



// export const BOOKS: {title: string, author: string, book_uuid: string}[] = [
//   {
//     title: 'The Great Brain',
//     author: 'John Fitzgerald',
//     book_uuid: '254c63eed97f4ac490e8213920c5178f',
//   },
//   {
//     title: 'The Great Brain: More Adventures of the Great Brain',
//     author: 'John Fitzgerald',
//     book_uuid: 'a180ebad7ede4adf90fe891ec9d7f187',
//   },
//   {
//     title: 'The Great Brain: Me and My Little Brain',
//     author: 'John Fitzgerald',
//     book_uuid: 'dab79048dc974fd999e93a786c1b0ef8',
//   },
//   {
//     title: 'The Great Brain: The Great Brain at the Academy',
//     author: 'John Fitzgerald',
//     book_uuid: '40b3cb20c8f44703a40a93d5af2949eb',
//   },
//   {
//     title: 'The Great Brain: The Great Brain Reforms',
//     author: 'John Fitzgerald',
//     book_uuid: '146e4842eaaa431cbcdc397a5b508593',
//   },
// ];


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
                    <Box sx={{borderRadius: 2, overflow: 'hidden'}}>
                      <Image src={`/api/book/${item.book_uuid}/cover`} alt={item.title} height={250} width={187} />
                    </Box>
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