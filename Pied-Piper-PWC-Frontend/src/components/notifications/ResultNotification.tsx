import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { StateSetterType } from '../../utilities/interfaces/Emails';

type ResultNotificationProps = {
  success: boolean;
  open: boolean;
  setOpen: StateSetterType<boolean>;
  autoHideDuration: number; // seconds
  description: string;
};

export default function ResultNotification(
  props: ResultNotificationProps,
): JSX.Element {
  const {
    success, open, setOpen, autoHideDuration, description,
  } = props;

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ): void => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration * 1000}
      onClose={handleClose}
    >
      <Alert severity={success ? 'success' : 'error'} onClose={handleClose}>
        {description}
      </Alert>
    </Snackbar>
  );
}
