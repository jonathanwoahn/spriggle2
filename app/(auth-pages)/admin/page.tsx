import { Box } from "@mui/material";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminMenu from "@/components/admin-menu";


/**
 * in settings, should be able to set the cashmere API key, the elevenlabs API key (or openai key)
 * supabase connection is in the .env file
 * 
 */


export default async function AdminPage() {
  return (
    <Box sx={{display: 'flex', width: '100%', flexDirection: 'row', bgcolor: 'orange'}}>
      <AdminMenu />

      <Box>
        ADMIN PAGE
        <ul>
          <li>dashboard</li>
          <li>collections</li>
          <li>settings</li>
        </ul>

      </Box>
      
      
    </Box>
  );
}