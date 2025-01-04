// 'use client';

import { Box } from "@mui/material";
import MediaPlayer from "./media-player";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PlayBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

    const supabase = await createClient();
  
    const { data: { user }, } = await supabase.auth.getUser();
  
    if (!user) {
      return redirect("/sign-in?message=You need to sign in to access this page");
    }
  
  return (
    <Box sx={{p: 2, pt: 4, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',}}>
      <MediaPlayer id={id} />
      {/* <Card>
        <CardActionArea href={`/book/${id}`}>
          <CardHeader 
            subheader="Harry Potter and the Sorcerer's Stone"
          />

        </CardActionArea>
        <CardContent>
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Box sx={{height: '300px', width: '240px', bgcolor: 'gray', borderRadius: 2, }}></Box>
          </Box>
          <PlayerProgress />
          <PlayerControls />
        </CardContent>
        <PlayerCardActions />
      </Card> */}
    </Box>
  );
}