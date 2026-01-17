'use client';

import { forgotPasswordAction } from "@/app/actions";
import { Box, Button, Card, TextField, Typography, Alert } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = new FormData();
      data.append('email', email);
      await forgotPasswordAction(data);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
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
              mb: 1,
              textAlign: 'center',
            }}
          >
            Reset Password
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 3,
              textAlign: 'center',
            }}
          >
            Remember your password?{' '}
            <Link
              href="/sign-in"
              style={{
                color: '#9966FF',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </Typography>

          {success ? (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Check your email for a password reset link.
            </Alert>
          ) : (
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleSubmit}
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
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {message && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  {message}
                </Alert>
              )}
            </Box>
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
          Note: Password reset requires SMTP to be configured.
        </Typography>
      </Box>
    </Box>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #9966FF 0%, #FF8866 100%)',
        }}
      >
        <Typography sx={{ color: 'white' }}>Loading...</Typography>
      </Box>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
