'use client';

import { Box, Drawer, IconButton, List, ListItemButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";
import { IBookData } from "@/lib/types";

interface ChapterDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bookData: IBookData;
  primaryColor?: string;
  secondaryColor?: string;
  onChapterSelect?: (order: number) => void;
}

export default function ChapterDrawer({
  isOpen,
  setIsOpen,
  bookData,
  primaryColor = '#9966FF',
  secondaryColor = '#7A52CC',
  onChapterSelect,
}: ChapterDrawerProps) {
  const [blockData, setBlockData] = useState<any>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const getMetadata = async () => {
      const blockResponse = await fetch(`/api/metadata?bookId=${bookData.uuid}&type=section`);
      const {data} = await blockResponse.json();
      setBlockData(data || []);
    }

    if (isOpen) {
      getMetadata();
    }
  },[bookData, isOpen]);

  // Get duration for a chapter - handle both snake_case and camelCase
  const getChapterDuration = (order: number) => {
    const block = blockData.find((b: any) =>
      (b.sectionOrder === order) || (b.section_order === order)
    );
    const duration = block?.data?.duration;
    if (duration && !isNaN(duration)) {
      return formatDuration(duration / 1000);
    }
    return null;
  };

  // Check if a section has audio (exists in blockData)
  const sectionHasAudio = (order: number) => {
    return blockData.some((b: any) =>
      (b.sectionOrder === order) || (b.section_order === order)
    );
  };

  // Filter nav to only show sections that have been ingested (have audio)
  const availableChapters = bookData.data.nav?.filter((navItem) =>
    sectionHasAudio(navItem.order)
  ) || [];

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      anchor={isMobile ? 'bottom' : 'right'}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          maxHeight: isMobile ? '80vh' : '100%',
          borderRadius: isMobile ? '8px 8px 0 0' : 0,
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            Chapters
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {bookData.data.title}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setIsOpen(false)}
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Chapter List */}
      <List sx={{ py: 1 }}>
        {availableChapters.length === 0 && blockData.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading chapters...
            </Typography>
          </Box>
        ) : availableChapters.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No chapters available yet.
            </Typography>
          </Box>
        ) : (
          availableChapters.map((navItem, idx) => {
            const duration = getChapterDuration(navItem.order);
            const handleClick = () => {
              setIsOpen(false);
              if (onChapterSelect) {
                onChapterSelect(navItem.order);
              }
            };
            // Use href for navigation only when onChapterSelect is not provided
            const linkProps = onChapterSelect
              ? {}
              : { href: `/book/${bookData.uuid}/play/${navItem.order}` };
            return (
              <ListItemButton
                key={navItem.order}
                {...linkProps}
                onClick={handleClick}
                sx={{
                  py: 2,
                  px: 3,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: `${primaryColor}08`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: `${primaryColor}15`,
                      color: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {navItem.label}
                  </Typography>
                </Box>
                {duration && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.secondary',
                      flexShrink: 0,
                    }}
                  >
                    <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {duration}
                    </Typography>
                  </Box>
                )}
              </ListItemButton>
            );
          })
        )}
      </List>
    </Drawer>
  );
}
