import { Box, Drawer, List, ListItem, Toolbar } from "@mui/material";
// import {styled} from '@mui/material/styles';

// const DrawerHeader = styled('div')(({ theme }) => ({
//   display: 'flex',
//   alignitems: 'center',
//   padding: theme.spacing(0,1),
//   ...theme.mixins.toolbar,
//   justifyContent: 'flex-end',
// }));

const DrawerHeader = () => (
  <Box>
    <h2>Admin Menu</h2>
  </Box>
)

export default function AdminMenu() {
  return (
    <Drawer
      variant="permanent"
      
      sx={{
        bcgolor: 'red',
        width: '240px',
        flexShrink: 0,
        ['& .MuiDrawer-paper']: { width: '240px', boxSizing: 'border-box', bgcolor: 'transparent' }
      }}
    >
      <Toolbar />
      <Box sx={{overflow: 'auto'}}>
        <List>
          <ListItem>Settings</ListItem>
        </List>
      </Box>
    </Drawer>
  );
}