import AdminMenu from "@/components/admin-menu";
import { createClient } from "@/utils/supabase/server";
import { Box } from "@mui/material";
import { redirect } from "next/navigation";


export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  
  return (
    <Box sx={{width: '100vw', display: 'flex', flexDirection: 'row', height: '100%'}}>
      <AdminMenu />
      <Box sx={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
        }}>
        {children}
      </Box>
    </Box>
  );
}
