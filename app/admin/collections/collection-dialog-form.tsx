'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState, MouseEvent, useEffect } from "react";


export default function CollectionDialogForm({ form = {name: '', description: ''}, isOpen, setIsOpen }: { form?: { [key: string]: string }, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: string }>(form);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => setFormData(form), [form])

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsThinking(true);

    try {
      const response = await fetch('/api/collections', {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      await response.json();

      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDirty) {
      setIsDirty(true);
    }
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    })
  }


  const handleCancel = () => {
    setFormData({});
    setIsDirty(false);
    setIsOpen(false);
  }

  const handleClose = () => {
    setFormData({});
    setIsDirty(false);
    setIsOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onClose={() => handleClose()}
      fullWidth={true}
      maxWidth={'sm'}
      component={'form'}
    >
      <DialogTitle>Create New Collection</DialogTitle>
      <DialogContent>
        <DialogContentText>
          A collection is a group of books. You can also think of it as a tag for a book. Collections will be displayed in carousels together.
        </DialogContentText>
        <TextField
          name="name"
          onChange={handleInputChange}
          value={formData.name}
          autoFocus
          required
          margin="dense"
          fullWidth
          label="Collection Name"
          variant="standard" />
        <TextField
          name="description"
          onChange={handleInputChange}
          value={formData.description}
          autoFocus
          required
          margin="dense"
          fullWidth
          multiline
          maxRows={3}
          label="Collection Description"
          variant="standard" />


      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleCancel()}>Cancel</Button>
        <Button
          onClick={(event) => handleSubmit(event)}
          disabled={!isDirty || isThinking}
          variant="contained"
          type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );

}