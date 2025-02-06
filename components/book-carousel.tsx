'use client';
import { Box, ButtonBase, Skeleton, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import CarouselCard from "./carousel-card";
import { IBlockMetadata } from "@/lib/types";

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
  const [books, setBooks] = useState<IBlockMetadata[]>();
  
  const settings = {
    ...defaultProps,
    ...props,
  };

  useEffect(() => {
    const initCollection = async (url: string) => {
      const res = await fetch(url);
      const { data: {collection, metadata: books}} = await res.json();

      setCollection(collection);
      setBooks(books);
    }

    let url = `/api/collections/carousel?` + (collectionId ? `collectionId=${collectionId}` : `bookId=${bookId}`);
    
    initCollection(url);
    
  }, [props.collectionId, props.bookId]);
  
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
          <Slider {...settings}>
            {books?.map((book, idx) => (<CarouselCard blockMetadata={book} key={idx} />))}
          </Slider>
        </Box>
      </Box>
    </>
  )
}