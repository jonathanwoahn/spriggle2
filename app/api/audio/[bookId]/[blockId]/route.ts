import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  res: NextRequest,
  { params }: { params: Promise<{ id: string, order: string }> }
) => {
  // const data = await params;

  return NextResponse.json({ });

  // // this should retrieve the proper file from the storage bucket. the goal is to proxy the request so the client doesn't have direct access to supabase
  // const supabase = await createClient();

  // const { data: audioData, error } = await supabase
  //   .storage
  //   .from('audio')
  //   .download(`${data.id}/${data.order}.mp3`);

  // if (error) {
  //   return {
  //     status: 404,
  //     json: { error: 'Audio file not found' }
  //   };
  // }

  // const audioBuffer = await audioData.arrayBuffer();
  // return new NextResponse(audioBuffer, {
  //   status: 200,
  //   headers: {
  //     'Content-Type': 'audio/mpeg',
  //   }
  // });
}