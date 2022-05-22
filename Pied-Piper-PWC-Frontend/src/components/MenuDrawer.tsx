import React from 'react';
import {
  Divider,
  Drawer, IconButton, List, ListItemButton, ListItemText, styled,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { theme as mainTheme } from '../theme';

type MenuDrawerProps = {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

type NavMenuItem = {
  displayText: string,
  address: string,
}

const navMenuItems: NavMenuItem[] = [
  {
    displayText: 'Home',
    address: '/',
  },
  {
    displayText: 'Quarantined Emails',
    address: '/view',
  },
  {
    displayText: 'Scanner Testing Tools',
    address: '/test',
  },
  {
    displayText: 'Scanner Settings',
    address: '/settings',
  },
];

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function MenuDrawer(props: MenuDrawerProps) : JSX.Element {
  const { open, setOpen } = props;

  const handleNavMenuClose = () : void => {
    setOpen(false);
  };

  return (
    <Drawer
      open={open}
      onClose={handleNavMenuClose}
    >
      <DrawerHeader>
        <IconButton onClick={handleNavMenuClose}>
          {mainTheme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {navMenuItems.map(({ displayText, address }) => (
          <ListItemButton component={RouterLink} to={address} key={displayText}>
            <ListItemText primary={displayText} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
