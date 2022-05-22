import React from 'react';
import { Help } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

type InfoButtonProps = {
  handleClick: () => void;
};
export default function InfoButton(props: InfoButtonProps): JSX.Element {
  const { handleClick } = props;

  return (
    <IconButton
      size="large"
      color="primary"
      onClick={handleClick}
    >
      <Help fontSize="inherit" />
    </IconButton>
  );
}
