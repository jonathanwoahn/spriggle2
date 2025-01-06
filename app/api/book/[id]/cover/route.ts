import Cashmere from "@/lib/cashmere";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  
  // TODO:  need to update this to dynamically get the route of the vercel API url
  const keyResponse = await fetch('http://localhost:3000/api/settings/cashmereApiKey');
  const { value } = await keyResponse.json();

  
  const cash = new Cashmere(value);
  const url = await cash.getBookCoverURL(id);

  // Fetch the actual image binary data
  const response = await fetch(url);
  if (!response.ok) {
    return new Response(`Failed to fetch book cover: ${response.statusText}`, { status: response.status });
  }

  const imageBuffer = await response.arrayBuffer();

  // Return the binary image data as a response
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg', // Use the original Content-Type or default to 'image/jpeg'
      'Content-Length': response.headers.get('Content-Length') || imageBuffer.byteLength.toString(),
    },
    status: 200,
  });
}