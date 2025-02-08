import { Box } from "@mui/material";
import MediaPlayer from "./media-player";
import { isUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerURL } from "@/lib/utils";

export default async function PlayBookPage({ params }: { params: Promise<{ id: string, order: string }> }) {
  const user = await isUser();


  const headersList = headers();
  const fullUrl = (await headersList).get('referer') || "";
  
  if (!user) {
    return redirect(`/sign-in?message=You need to sign in to access this page&redirect_to=${fullUrl}`);
  }
  
  const { id, order } = await params;
  
  const url = `${getServerURL()}/api/book/${id}`;
  const response = await fetch(url);

  if(!response.ok) {
    throw new Error(`Failed to fetch book data: ${response.statusText}`);
  }
  
  const bookData = await response.json();
  
  const res = await fetch(`${getServerURL()}/api/metadata?bookId=${id}&type=text&sectionOrder=${order}`);
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