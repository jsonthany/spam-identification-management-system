import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LoadingButton from '@mui/lab/LoadingButton';
import Paper from '@mui/material/Paper';
import { analyzeEmail } from '../../services/emailService';

export default function TestingForm(): JSX.Element {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState({
    emailId: '',
    classifierResult: {
      classification: '',
      riskScore: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async (): Promise<void> => {
    setLoading(true);
    try {
      const analysis = await analyzeEmail(email);
      setResults(analysis);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message) setError(e.message);
        else {
          setError('Server Error');
        }
      } else {
        setError('Something went wrong');
      }
    }
    setLoading(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Scanner Testing Tools
      </Typography>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12}>
          <Stack spacing={2} direction="row">
            <LoadingButton
              variant="outlined"
              onClick={handleClick}
              loading={loading}
            >
              Test
            </LoadingButton>
            <Tooltip title="Paste RAW email text below">
              <div style={{ paddingTop: '5px' }}>
                <HelpOutlineIcon />
              </div>
            </Tooltip>
          </Stack>
        </Grid>
        {results.emailId.length ? (
          <Grid item xs={3} alignItems="center">
            <Paper>
              <Stack spacing={0} padding={3}>
                <Typography variant="h6" component="div">
                  {`Analysis ID: ${results.emailId}`}
                </Typography>
                <Typography variant="body1" component="div">
                  {`Classification: ${results.classifierResult.classification}`}
                </Typography>
                <Typography variant="body1" component="div">
                  {`Risk Score: ${results.classifierResult.riskScore}`}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ) : null}

        {error.length ? (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom component="div">
              {error}
            </Typography>
          </Grid>
        ) : null}
        <Grid item xs={12}>
          <TextField
            id="body"
            name="body"
            label="Original Email"
            style={{ backgroundColor: 'white' }}
            multiline
            rows={15}
            fullWidth
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </>
  );
}
