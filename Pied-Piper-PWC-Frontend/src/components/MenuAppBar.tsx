import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import { FixMeLater } from '../fixMeLater';
import MenuDrawer from './MenuDrawer';

type props = {
  // TODO : fix this when account info is real
  setAccount: (a: boolean) => void;
};

export default function MenuAppBar({ setAccount }: props): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const handleNavMenuOpen = (): void => {
    setOpen(true);
  };

  const handleUserMenuOpen = (event: FixMeLater): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAccount(false);
    localStorage.removeItem('jwtTokenCybermail');
  };

  const handleUserMenuClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: '#2E3B55' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleNavMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link
              component={RouterLink}
              style={{
                width: '33%',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'white',
              }}
              // onClick={() => navigate('/')}
              to="/"
            >
              Cyber Mail Admin Panel (Pied Piper)
            </Link>
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={() => handleClose()}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <MenuDrawer open={open} setOpen={setOpen} />
    </Box>
  );
}
