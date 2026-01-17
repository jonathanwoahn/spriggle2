'use client';

import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { ReactNode } from "react";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  icon,
  breadcrumbs,
  actions,
}: AdminPageHeaderProps) {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #9966FF 0%, #7A52CC 50%, #5C3D99 100%)',
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 136, 102, 0.15)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          right: 100,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />}
          sx={{ mb: 1 }}
        >
          <Link
            href="/admin"
            underline="hover"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem',
              '&:hover': { color: 'white' },
            }}
          >
            Admin
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            crumb.href ? (
              <Link
                key={idx}
                href={crumb.href}
                underline="hover"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem',
                  '&:hover': { color: 'white' },
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography
                key={idx}
                sx={{
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              >
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}

      {/* Main content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                '& .MuiSvgIcon-root': {
                  fontSize: 28,
                },
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {actions && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
