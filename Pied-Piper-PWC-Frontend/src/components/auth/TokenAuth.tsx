import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { FixMeLater } from '../../fixMeLater';
import { getEmails } from '../../services/emailService';
import { setAuthHeader } from '../../services/httpService';

type authPageProps = {
  setAccount: (input: FixMeLater) => void;
};

const theme = createTheme();

export default function SignIn({ setAccount }: authPageProps): JSX.Element {
  const navigate = useNavigate();
  const [fail, setFail] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleSubmit = async (): Promise<void> => {
    setAuthHeader(value);

    try {
      await getEmails();
      setAccount(true);
      localStorage.setItem('jwtTokenCybermail', value);
      navigate('/dashboard');
    } catch (error) {
      setFail(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {fail ? (
            <Typography variant="body1">Wrong credentials!</Typography>
          ) : null}
          <TextField
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            margin="normal"
            required
            fullWidth
            id="token"
            label="Server Token"
            name="token"
            autoFocus
          />
          <Button onClick={() => handleSubmit()}>Sign In</Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
