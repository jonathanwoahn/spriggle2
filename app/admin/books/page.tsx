import { Box } from "@mui/material";
import BooksTable from "./books-table";
import AdminPageHeader from "@/components/admin-page-header";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

export default function BooksPage() {
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
        title="Books"
        subtitle="Manage your audiobook catalog"
        icon={<LibraryBooksIcon />}
        breadcrumbs={[{ label: 'Books' }]}
      />
      <BooksTable />
    </Box>
  );
}