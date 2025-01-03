'use client';

import { signUpAction } from "@/app/actions";
import { Message } from "@/components/form-message";
import { Box, Button, Card, CardActions, CardContent, CardHeader, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

export default function SignUpForm({message}: {message?: Message}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  
  const handleClick = async () => {
    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    await signUpAction(data);
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2}}>
      <Box sx={{maxWidth: '420px', width: '100%'}}>
        <Box>
          <Typography variant="h4">Sign Up</Typography>
          <Typography variant="body2">
            Already have an account?{" "}
            <Link href="/sign-in">
              Sign in
            </Link>
          </Typography>

        </Box>
        <Card sx={{width: '100%', marginTop: 2, p: 2}}>
          <Box
            component="form"
            sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
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
              placeholder="Make it secure"
              type="password"
              onChange={handleInputChange}
            />
          </Box>
          <CardActions sx={{display: 'flex', justifyContent: 'center'}}>
            <Button variant="contained" onClick={() => handleClick()}>Sign Up</Button>

          </CardActions>
          <Typography variant="body2" color="error">
            {message?.error}
          </Typography>

        </Card>

      </Box>
    </Box>
  );
}