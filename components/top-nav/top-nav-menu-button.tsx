'use client';
import { Box, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useMenuContext } from "@/context/admin-menu-context";
import { usePathname } from "next/navigation";

export default function TopNavMenuButton() {
  const {handleDrawerToggle} = useMenuContext();
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith('/admin');
  if(!isAdminRoute) { return null; }

  return (
    <Box sx={{display: {xs: 'block', sm: 'none'}}}>
      <IconButton onClick={handleDrawerToggle}>
        <MenuIcon />
      </IconButton>
    </Box>
  );
}