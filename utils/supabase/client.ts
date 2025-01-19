import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  export const isAdmin = async () => {
    const supabase = createClient();
    const { data: {user}} = await supabase.auth.getUser();
    // TODO: Retrieve this from supabase AppSettings table
    return user && user.email === 'jonathanwoahn@gmail.com';
  }
