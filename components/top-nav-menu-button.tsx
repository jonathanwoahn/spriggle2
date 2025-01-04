'use client';
import { Box, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useMenuContext } from "@/context/admin-menu-context";

export default function TopNavMenuButton() {
  const {handleDrawerToggle} = useMenuContext();
  
  return (
    <Box sx={{display: {xs: 'block', sm: 'none'}}}>
      <IconButton onClick={handleDrawerToggle}>
        <MenuIcon />
      </IconButton>
    </Box>
  );
}