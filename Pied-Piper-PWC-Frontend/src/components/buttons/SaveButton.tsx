import React from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

type SubmitAllButtonProps = {
  disabled: boolean;
  handleClick: (event: React.MouseEvent) => void;
  loading: boolean;
}
export default function SaveButton(props: SubmitAllButtonProps) : JSX.Element {
  const { disabled, handleClick, loading } = props;
  return (
    <LoadingButton
      disabled={disabled}
      loading={loading}
      loadingPosition="start"
      onClick={handleClick}
      startIcon={<SaveIcon />}
      variant="contained"
    >
      Save
    </LoadingButton>
  );
}
