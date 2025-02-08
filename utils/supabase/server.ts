import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};

export const isAdmin = async () => {
  const supabase = await createClient();
  const { data: {user}} = await supabase.auth.getUser();
  
  // TODO: Retrieve this from supabase AppSettings table
  return !!(user && (user.email === 'jonathanwoahn@gmail.com'));
}

export const isUser = async () => {
  const supabase = await createClient();
  const { data: {user}} = await supabase.auth.getUser();
  
  return !!user;
}