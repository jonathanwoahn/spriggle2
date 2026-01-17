'use client';

import { signInAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import { Box, Button, Card, TextField, Typography, Alert } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MouseEvent, useState } from "react";

export default function SignInForm({ message }: { message?: Message }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('callbackUrl') || searchParams.get('redirect_to') || '/admin';

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();
      data.append('email', formData.email);
      data.append('password', formData.password);
      await signInAction(data, redirect);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #9966FF 0%, #FF8866 100%)',
        p: 2,
      }}
    >
      <Box sx={{ maxWidth: '420px', width: '100%' }}>
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 4,
          }}
        >
          <AutoStoriesIcon sx={{ fontSize: 40, color: 'white' }} />
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            Spriggle
          </Typography>
        </Box>

        <Card
          sx={{
            width: '100%',
            p: 4,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              textAlign: 'center',
            }}
          >
            Sign In
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 3,
              textAlign: 'center',
            }}
          >
            Welcome back! Enter your credentials to continue.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              textAlign: 'center',
            }}
          >
            Don't have an account?{' '}
            <Link
              href="/sign-up"
              style={{
                color: '#9966FF',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Create one
            </Link>
          </Typography>

          {message && 'message' in message && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              {message.message}
            </Alert>
          )}

          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              required
              type="email"
              variant="outlined"
              name="email"
              label="Email"
              placeholder="you@example.com"
              onChange={handleInputChange}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              required
              variant="outlined"
              name="password"
              label="Password"
              placeholder="Your password"
              type="password"
              onChange={handleInputChange}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
              <Link
                href="/forgot-password"
                style={{
                  color: '#9966FF',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              variant="contained"
              onClick={(event) => handleClick(event)}
              disabled={loading}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #9966FF 0%, #7A52CC 100%)',
                boxShadow: '0 4px 12px rgba(153, 102, 255, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8855EE 0%, #6941BB 100%)',
                  boxShadow: '0 6px 16px rgba(153, 102, 255, 0.5)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          {message && 'error' in message && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {message.error}
            </Alert>
          )}
        </Card>
      </Box>
    </Box>
  );
}
