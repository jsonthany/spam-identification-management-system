import React from 'react';
import Button from '@mui/material/Button';
import UndoIcon from '@mui/icons-material/Undo';
import { Tooltip } from '@mui/material';
import { defaultTooltipValues, TooltipTitleType } from '../../utilities/interfaces/types';

type UndoButtonProps = {
  tooltipTitle?: TooltipTitleType;
  handleUndo: (event: React.MouseEvent) => void;
}
export default function UndoButton({
  tooltipTitle = defaultTooltipValues.tooltipTitle,
  ...props
}: UndoButtonProps): JSX.Element {
  const { handleUndo } = props;
  return (
    <Tooltip title={tooltipTitle}>
      <Button
        variant="outlined"
        startIcon={<UndoIcon />}
        onClick={handleUndo}
      >
        Undo
      </Button>
    </Tooltip>
  );
}

UndoButton.defaultProps = defaultTooltipValues;
