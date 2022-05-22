import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { email, emailApprovalList } from '../../utilities/interfaces/Emails';
import { getEmail } from '../../services/emailService';
import LoadingBackdrop from '../misc/LoadingBackdrop';
import dateFormatter from '../../utilities/helpers/dateFormatter';

/* eslint-disable */
let unescapeJs = require('unescape-js');

type SimpleDialogProps = {
  open: boolean;
  displayValue: string;
  onClose: (value: boolean) => void;
};

function SimpleDialog(props: SimpleDialogProps): JSX.Element {
  const { open, onClose, displayValue } = props;

  const handleClose = (): void => {
    onClose(false);
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="xl">
      <DialogTitle>RAW Email Data</DialogTitle>
      <Box>{displayValue}</Box>
    </Dialog>
  );
}

type emailDisplayProps = {
  currentEmailId: string;
  setCurrentEmailId: (a: string) => void;
  handleApproval: (a: emailApprovalList) => void;
};

export default function EmailDisplay(props: emailDisplayProps): JSX.Element {
  const { currentEmailId, setCurrentEmailId, handleApproval } = props;
  const navigate = useNavigate();

  const [emailData, setEmailData] = useState<email>({
    emailSubject: '',
    receivedTimestamp: '',
    fromAddress: '',
    toAddress: '',
    id: '',
    emailBody: '',
    rawEmail: '',
  });

  useEffect(() => {
    window.history.pushState(null, '', document.URL);
    window.addEventListener('popstate', () => {
      navigate('/view');
      setCurrentEmailId('');
    });
  }, [navigate, setCurrentEmailId]);

  const [loading, setLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState('');
  const [showingRaw, showRaw] = useState(false);

  useEffect(() => {
    async function getEmailData(): Promise<void> {
      const useId = currentEmailId;
      try {
        const data: email = await getEmail(useId);
        setEmailData(data);
        setLoading(false);
      } catch (e) {
        if (e instanceof Error) {
          setInitialLoadError(e.message);
        } else {
          setInitialLoadError('Something went wrong');
        }
      }
    }
    getEmailData();
  }, [currentEmailId]);

  return (
    <div>
      <LoadingBackdrop loading={loading} initialLoadError={initialLoadError} />
      <SimpleDialog
        open={showingRaw}
        displayValue={
          emailData.rawEmail
            ? unescapeJs(emailData.rawEmail)
            : JSON.stringify(emailData)
        }
        onClose={showRaw}
      />
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
        style={{ padding: '40px' }}
      >
        <Button
          variant="text"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            navigate('/view');
            setCurrentEmailId('');
          }}
        />
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={11}>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="left"
            >
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() =>
                  handleApproval([
                    { id: emailData.id, quarantineStatus: 'ALLOWED' },
                  ])
                }
              >
                Allow
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() =>
                  handleApproval([
                    { id: emailData.id, quarantineStatus: 'DENIED' },
                  ])
                }
              >
                Deny
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={1}>
            <Button
              variant="text"
              size="large"
              startIcon={<ReadMoreIcon />}
              onClick={() => showRaw(true)}
            >
              Raw
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography
              component="h1"
              variant="h5"
              align="left"
              color="text.primary"
              gutterBottom
            >
              {emailData.emailSubject}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            <Typography variant="h6" align="left" color="text.primary">
              From: {` ${emailData.fromAddress}`}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            <Typography
              component="h1"
              variant="h6"
              align="right"
              color="text.primary"
            >
              {emailData.receivedTimestamp.length
                ? dateFormatter(emailData.receivedTimestamp)
                : null}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" align="left" color="text.primary">
              To: {` ${emailData.toAddress}`}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="body1"
              align="left"
              color="text.primary"
              paragraph
            >
              {emailData.emailBody}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
