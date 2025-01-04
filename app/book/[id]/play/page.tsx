// 'use client';

import { Box } from "@mui/material";
import MediaPlayer from "./media-player";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PlayBookPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user }, } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in?message=You need to sign in to access this page");
  }
  
  const { id } = await params;
  const url = `http://localhost:3000/api/book/${id}`;
  const response = await fetch(url);
  const bookData = await response.json();

  

  return (
    <Box sx={{p: 2, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',}}>
      <MediaPlayer bookData={bookData} />
    </Box>
  );
}