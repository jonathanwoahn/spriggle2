'use client';
import { Box, ButtonBase, Skeleton, Typography } from "@mui/material";
import Slider from "react-slick";
import { useEffect, useState } from "react";
import CarouselCard from "./carousel-card";
import { IOmnipub } from "@/lib/types";

export interface IBookCarousel {
  // provide a collection ID if you want to display the books associated with a collection
  collectionId?: number;

  // provide a book ID if you want to display books similar to a specific book title
  bookId?: string;
  
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

  const {collectionId, bookId} = props;

  const [collection, setCollection] = useState<{description: string, name: string,} | undefined>();
  const [books, setBooks] = useState<IOmnipub[]>();

  // Compute settings dynamically based on number of books
  const baseSettings = {
    ...defaultProps,
    ...props,
  };

  // Adjust settings when there are fewer books than slidesToShow
  const bookCount = books?.length || 0;
  const effectiveSlidesToShow = Math.max(1, Math.min(baseSettings.slidesToShow || 6, bookCount));
  const settings = {
    ...baseSettings,
    slidesToShow: effectiveSlidesToShow,
    // Disable infinite when not enough slides
    infinite: bookCount > effectiveSlidesToShow,
    // Disable dots when not enough slides for scrolling
    dots: bookCount > effectiveSlidesToShow,
  };

  // Show simple flex grid when there are too few books for carousel
  const showSimpleGrid = bookCount > 0 && bookCount <= 3;

  useEffect(() => {
    const initCollection = async (url: string) => {
      const res = await fetch(url);
      const json = await res.json();

      if (json.data) {
        setCollection(json.data.collection);
        setBooks(json.data.books);
      }
    }

    // Build URL with only defined parameters
    let url = `/api/collections/carousel`;
    if (collectionId) {
      url += `?collectionId=${collectionId}`;
    } else if (bookId) {
      url += `?bookId=${bookId}`;
    }
    // If neither is provided, still fetch to get default/all books

    initCollection(url);

  }, [collectionId, bookId]);
  
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', }}>
        {collection ? (
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Typography variant="h4" sx={{ mb: 1 }}>{collection?.name}</Typography>
          </Box>
          
        ) : (
          <Skeleton animation="wave" variant="text" width={320} sx={{fontSize: '2rem'}} />
        )}
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
          {books ? (
            showSimpleGrid ? (
              // Simple flex grid for few books
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {books.map((book) => (<CarouselCard book={book} key={book.uuid} />))}
              </Box>
            ) : (
              <Slider {...settings}>
                {books.map((book) => (<CarouselCard book={book} key={book.uuid} />))}
              </Slider>
            )
          ) : (
            <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden', justifyContent: 'center' }}>
              {[...Array(6)].map((_, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, minWidth: 200 }}>
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width={160}
                    height={220}
                    sx={{ borderRadius: 2, mb: 2 }}
                  />
                  <Skeleton animation="wave" variant="text" width={140} sx={{ fontSize: '1rem' }} />
                  <Skeleton animation="wave" variant="text" width={100} sx={{ fontSize: '0.75rem' }} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  )
}