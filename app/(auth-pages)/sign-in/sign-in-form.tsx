'use client';

import { signInAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import { Box, Button, Card, CardActions, TextField, Typography } from "@mui/material";
import { Metadata } from "next";
import Link from "next/link";
import { MouseEventHandler, useState } from "react";

export default function SignInForm({message}: {message?: Message}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async (e: MouseEventHandler<HTMLButtonElement>) => {
    e.preventDefault();

    try {

      setLoading(true);
      const data = new FormData();
      data.append('email', formData.email);
      data.append('password', formData.password);
      await signInAction(data);
    } catch(error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Box sx={{ maxWidth: '420px', width: '100%' }}>
        <Box>
          <Typography variant="h4">Sign In</Typography>
          <Typography variant="body2">
            Don't have an account yet?{" "}
            <Link href="/sign-up">
              Sign Up
            </Link>
          </Typography>

        </Box>
        <Card sx={{ width: '100%', marginTop: 2, p: 2 }}>
          <Box
            component="form"
            sx={{display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              type="email"
              variant="standard"
              name="email"
              label="Email"
              placeholder="you@example.com"
              onChange={handleInputChange}
            />
            <TextField
              required
              variant="standard"
              name="password"
              label="Password"
              placeholder="Your password"
              type="password"
              helperText={
                <Link href="/forgot-password">
                  Forgot Password?
                </Link>
              }
              onChange={handleInputChange}
            />
          </Box>
          <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={(event) => handleClick(event)} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardActions>
          <Typography variant="body2" color="error">
            {message?.error}
          </Typography>
        </Card>

      </Box>
    </Box>
  );
}