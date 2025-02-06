import AdminMenu from "@/components/admin-menu";
import { createClient, isAdmin } from "@/utils/supabase/server";
import { Box } from "@mui/material";
import { notFound, redirect } from "next/navigation";


export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  const admin = await isAdmin();
  console.log('ADMIN: ', admin);
  if(!admin) {
    return notFound();
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
