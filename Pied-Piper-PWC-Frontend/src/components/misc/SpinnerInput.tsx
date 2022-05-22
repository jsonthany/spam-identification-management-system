/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { TextField, Tooltip } from '@mui/material';
import { ChangeEventAlias } from '../../utilities/interfaces/Emails';
import capNumberValue from '../../utilities/helpers/capNumberValue';
import { TooltipTitleType } from '../../utilities/interfaces/types';

interface SpinnerInputProps {
  value: number;
  minValue: number;
  maxValue: number;
  tooltipTitle?: TooltipTitleType;
  handler: (value: number) => void;
  [key: string]: unknown;
}
const defaultValues = {
  tooltipTitle: '',
};
export default function SpinnerInput({
  tooltipTitle = defaultValues.tooltipTitle,
  ...props
}: SpinnerInputProps): JSX.Element {
  const {
    value, minValue, maxValue, handler, ...rest
  } = props;

  const handleValueChange = (event: ChangeEventAlias): void => {
    event.preventDefault();

    let newValue = parseInt(event.target.value, 10);
    if (!Number.isNaN(newValue)) {
      newValue = capNumberValue(newValue, minValue, maxValue);
      handler(newValue);
    }
  };

  return (
    <Tooltip title={tooltipTitle}>
      <TextField
        type="number"
        value={value}
        onChange={handleValueChange}
        {...rest}
      />
    </Tooltip>
  );
}

SpinnerInput.defaultProps = defaultValues;
