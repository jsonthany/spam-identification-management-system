import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Backdrop, CircularProgress } from '@mui/material';
import React from 'react';

type LoadingBackdropProps = {
  loading: boolean;
  initialLoadError: string;
}

export default function LoadingBackdrop(props: LoadingBackdropProps) : JSX.Element {
  const { loading, initialLoadError } = props;

  return (
    <Backdrop
      sx={{ color: '#fff', position: 'absolute', zIndex: (theme) => theme.zIndex.drawer - 1 }}
      open={loading}
    >
      {initialLoadError
        ? (
          <Typography sx={{ fontSize: 'h5.fontSize', textAlign: 'center' }}>{initialLoadError}</Typography>
        ) : (
          <Grid container justifyContent="center" alignItems="center">
            <CircularProgress color="inherit" size="4em" />
            <Typography sx={{ fontSize: 'h4.fontSize', m: 2 }}>Loading...</Typography>
          </Grid>
        )}
    </Backdrop>
  );
}
