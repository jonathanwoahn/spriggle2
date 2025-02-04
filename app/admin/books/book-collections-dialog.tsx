'use client';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";

export default function BookCollectionsDialog({isOpen, setIsOpen, bookIds}: {isOpen: boolean, setIsOpen: (open: boolean) => void, bookIds: string[]}) {

  const [collections, setCollections] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const getCollections = async () => {
      const response = await fetch(`/api/collections?page=0&rowsPerPage=100&order=name`);
      const { data, count } = await response.json();

      setCollections(data);
    }

    getCollections();
    
  }, [bookIds]);

  const closeDialog = () => {
    setSelected([]);
    setIsOpen(false);
  }
  
  const selectAll = () => {
    if(selected.length === collections.length) {
      setSelected([]);
    }else {
      setSelected(collections.map((collection) => collection.id));
    }
  }

  const saveUpdates = async () => {
    const body = {
      bookIds,
      collectionIds: selected,
    };
    
    const req = await fetch(`/api/collection-books`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if(!req.ok) {
      console.log(req.statusText);
      throw new Error('problem inserting data');
    }

    closeDialog();
  }
  
  
  return (
    <Dialog open={isOpen} onClose={() => closeDialog()}>
      <DialogTitle>Set collections for {bookIds.length} books</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox">
                <Checkbox
                  onClick={() => selectAll()}
                  checked={collections.length > 0 && selected.length === collections.length}
                  indeterminate={selected.length > 0 && selected.length < collections.length}
                />
              </TableCell>
              <TableCell>Collection</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>

          </TableHead>
          <TableBody>
            {collections.map((collection, idx) => (
              <TableRow key={idx}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(collection.id)}
                    onChange={() => {
                      if(selected.includes(collection.id)) {
                        setSelected(selected.filter((id) => id !== collection.id));
                      }else {
                        setSelected([...selected, collection.id]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{collection.name}</TableCell>
                <TableCell>{collection.description}</TableCell>
              </TableRow>
            ))}
            
          </TableBody>
        </Table>
        {/* {JSON.stringify(collections)} */}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeDialog()}>Cancel</Button>
        <Button
          onClick={() => saveUpdates()}
          variant="contained"
          disabled={selected.length === 0}>Save</Button>
      </DialogActions>
    </Dialog>
  );

}