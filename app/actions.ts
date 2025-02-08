"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Cashmere from "@/lib/cashmere";
import { getServerURL } from "@/lib/utils";

export const signUpAction = async (formData: FormData, redirect_to?: string) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirect_to ? `${getServerURL()}/auth/callback?redirect_to=${redirect_to}` : `${getServerURL()}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData, redirect_to?: string) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", `/sign-in&redirect_to=${redirect_to}`, error.message);
  }

  return redirect_to ? redirect(redirect_to) : redirect('/');
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getServerURL()}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export interface ISetting {
  description: string;
  field: string;
  id: number;
  key: string;
  type: 'string' | 'boolean';
  value: string;
  order: number;
}

export const saveSettings = async (settings: ISetting[]) => {
  await fetch(`${getServerURL()}/api/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  })
}

export const getJobCount = async ({bookId }: { bookId: string }) => {

  // get the cashmere api key
  const response = await fetch(`${getServerURL()}/api/settings/cashmereApiKey`);
  const { value } = await response.json();

  const cash = new Cashmere(value);

  const allBlocks = await cash.getAllBookBlocks(bookId);
  const coreBlocks = allBlocks.reduce((acc: number, curr: any) => {
    const count = curr.blocks.filter((block: any) => block.type === 'book' || block.type === 'section' || block.type === 'text').length;
    return acc + count;
  }, 1); // the starting point of "1" accounts for the book block that doesn't get retrieved from cashmere right now
  const sections = allBlocks.length;


  

  console.log(coreBlocks, sections);
  
  // const coreBlocks = allBlocks.filter((block: any) => block.type === 'book' || block.type === 'section' || block.type === 'text').length;
  // const sections = allBlocks.filter((block: any) => block.type === 'section');
  // const sectionBlocks = sections.length;
  
  const sb = await createClient();
  
  const {data: audioData, error: errorData} = await sb.storage.from('audio').list(`${bookId}/`, { limit: 10000 });
  
  if(!audioData) return;

  const audioCount = allBlocks.reduce((acc: number, curr: any) => {
    const filename = `${bookId}-${curr.navItem.order}.mp3`;
    const idx = audioData.findIndex((audio: any) => audio.name === filename);
    if(idx > -1) {
      acc += 1;
    }

    return acc;
  }, 0);

  /**
   * information we need to get (by book id):
   * 1. total # of jobs (sb)
   * 2. total # of completed jobs (sb)
   * 3. total # of metadata blocks (sb)
   * 5. total duration of the book (sb)
   * 6. total # of audio files (sb storage)
   * 8. has summary (sb)
   * 9. has embedding (sb)
   * 4. total number of blocks (text, section, book) in the book (cash)
   * 7. total # of section blocks (cash)
   */
  
  
  
  
  const query = `
WITH book_jobs AS (
  SELECT 
    (data->>'bookId') AS book_id,
    COUNT(*) AS total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_jobs
  FROM jobs
  WHERE (data->>'bookId') = '${bookId}'
  GROUP BY (data->>'bookId')
),
metadata_blocks AS (
  SELECT 
    book_id,
    COUNT(*) AS total_metadata_blocks,
    SUM((data->>'duration')::numeric) FILTER (WHERE type = 'section') AS total_duration,
    BOOL_OR(CASE WHEN type = 'book' AND data->>'summary' IS NOT NULL THEN true ELSE false END) AS has_summary,
    BOOL_OR(CASE WHEN type = 'book' AND embedding IS NOT NULL THEN true ELSE false END) AS has_embedding
  FROM block_metadata
  WHERE book_id = '${bookId}'
  GROUP BY book_id
)
SELECT jsonb_build_object(
  'totalJobs', COALESCE(bj.total_jobs, 0),
  'completedJobs', COALESCE(bj.completed_jobs, 0),
  'metadataBlocks', COALESCE(mb.total_metadata_blocks, 0),
  'duration', COALESCE(mb.total_duration, 0),
  'hasSummary', COALESCE(mb.has_summary, false),
  'hasEmbedding', COALESCE(mb.has_embedding, false)
) AS result
FROM (SELECT '${bookId}' AS book_id) b
LEFT JOIN book_jobs bj ON b.book_id = bj.book_id
LEFT JOIN metadata_blocks mb ON b.book_id = mb.book_id;
`;

  const {data, error} =  await sb.rpc('execute_sql', { sql: query });

  if(error) {
    console.error(error);
    return;
  }
  
  return {
    ...data,
    audioCount,
    coreBlocks,
    sections,
  };
}
