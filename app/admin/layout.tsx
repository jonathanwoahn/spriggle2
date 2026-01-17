import AdminMenu from "@/components/admin-menu";
import { isAdmin } from "@/lib/auth";
import { Box } from "@mui/material";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  if (!admin) {
    return notFound();
  }

  return (
    <Box
      sx={{
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#f8f9fc',
      }}
    >
      <AdminMenu />
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
