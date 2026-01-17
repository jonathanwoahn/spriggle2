'use client';

import { signUpAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import { Box, Button, Card, TextField, Typography } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import Link from "next/link";
import { useState } from "react";

export default function SignUpForm({ message }: { message?: Message }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleClick = async () => {
    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    await signUpAction(data);
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
            Sign Up
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 3,
              textAlign: 'center',
            }}
          >
            Create a new account to get started.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              textAlign: 'center',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/sign-in"
              style={{
                color: '#9966FF',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Sign in instead
            </Link>
          </Typography>

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
              placeholder="Create a secure password"
              type="password"
              onChange={handleInputChange}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              variant="contained"
              onClick={() => handleClick()}
              fullWidth
              sx={{
                mt: 1,
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
              }}
            >
              Create Account
            </Button>
          </Box>

          {message && 'error' in message && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 2, textAlign: 'center' }}
            >
              {message.error}
            </Typography>
          )}
        </Card>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            mt: 3,
            textAlign: 'center',
          }}
        >
          By signing up, you agree to our{' '}
          <Link
            href="/terms-of-use"
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy-policy"
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
