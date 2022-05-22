import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';
import { StateSetterType } from '../../utilities/interfaces/Emails';

type ConfirmationDialogProps = {
  open: boolean;
  title?: string;
  contentText: string;
  setOpen: StateSetterType<boolean>;
  handleConfirm: () => void;
};
function ConfirmationDialog(props: ConfirmationDialogProps): JSX.Element {
  const {
    open, title, contentText, setOpen, handleConfirm,
  } = props;

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirm}>OK</Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.defaultProps = {
  title: '',
};

export default ConfirmationDialog;
