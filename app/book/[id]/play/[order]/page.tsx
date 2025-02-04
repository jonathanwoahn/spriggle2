import { Box } from "@mui/material";
import MediaPlayer from "./media-player";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";





export default async function PlayBookPage({ params }: { params: Promise<{ id: string, order: string }> }) {
  const supabase = await createClient();
  const { data: { user }, } = await supabase.auth.getUser();


  const headersList = headers();
  const fullUrl = (await headersList).get('referer') || "";
  
  if (!user) {
    return redirect(`/sign-in?message=You need to sign in to access this page&redirect_to=${fullUrl}`);
  }
  
  const { id, order } = await params;
  
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  
  const url = `${defaultUrl}/api/book/${id}`;
  const response = await fetch(url);

  if(!response.ok) {
    throw new Error(`Failed to fetch book data: ${response.statusText}`);
  }
  
  const bookData = await response.json();
  
  const res = await fetch(`${defaultUrl}/api/metadata?bookId=${id}&type=text&sectionOrder=${order}`);
  if(!res.ok) {
    throw new Error(`Failed to fetch metadata: ${res.statusText}`);
  }

  const { data: metadata } = await res.json();

  return (
    <Box sx={{p: 2, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',}}>
      <MediaPlayer bookData={bookData} metadata={metadata} />
    </Box>
  );
}