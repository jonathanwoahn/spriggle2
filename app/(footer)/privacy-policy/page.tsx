import LegalMuiMarkdown from "@/components/footer/legal-mui-markdown";
import { createClient } from "@/utils/supabase/server";
import { Box, Container } from "@mui/material";

export default async function PrivacyPolicyPage() {
  const sb = await createClient();

  const { data, error } = await sb.from('legal_docs').select('*').eq('key', 'privacy-policy').single();

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
        <LegalMuiMarkdown content={data.content} />
      </Box>
    </Container>
  );
}