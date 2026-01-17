import { Box } from "@mui/material";
import CollectionsTable from "./collections-table";
import AdminPageHeader from "@/components/admin-page-header";
import CollectionsIcon from '@mui/icons-material/Collections';

export default function CollectionsPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
      }}
    >
      <AdminPageHeader
        title="Collections"
        subtitle="Organize books into themed collections"
        icon={<CollectionsIcon />}
        breadcrumbs={[{ label: 'Collections' }]}
      />
      <CollectionsTable />
    </Box>
  );
}