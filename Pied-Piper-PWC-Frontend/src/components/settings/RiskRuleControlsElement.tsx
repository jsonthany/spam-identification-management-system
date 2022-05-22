import React from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import UndoIcon from '@mui/icons-material/Undo';
import { Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import RiskRule from '../../utilities/interfaces/RiskRule';
import SpinnerInput from '../misc/SpinnerInput';
import HelpTooltipText from '../misc/HelpTooltipText';

type RuleControlsProps = {
  rule: RiskRule;
  maxRuleScore: number;
  handleChange: (value: number) => void;
  handleReset: (event: React.MouseEvent) => void;
}

export default function RiskRuleControlsElement(props: RuleControlsProps) : JSX.Element {
  const {
    rule, maxRuleScore, handleChange, handleReset,
  } = props;
  const { name, description, score } = rule;
  return (
    <Grid
      container
      item
      direction="row"
      spacing={{ xs: 2, md: 3 }}
      columns={{ xs: 4, sm: 8, md: 12 }}
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={3} sm={6.5} md={10}>
        <Typography
          variant="body2"
        >
          {description}
        </Typography>
      </Grid>
      <Grid
        container
        item
        xs={0.75}
        sm={1.25}
        justifyContent="center"
      >
        <SpinnerInput
          size="small"
          id={`rule-${name}`}
          sx={{ minWidth: '4em', maxWidth: '7em' }}
          tooltipTitle={<HelpTooltipText firstLine="Enter the risk score for this rule." />}
          value={score}
          minValue={0}
          maxValue={maxRuleScore}
          handler={handleChange}
        />
      </Grid>
      <Grid
        container
        item
        xs={0.25}
        justifyContent="center"
      >
        <Tooltip
          title={
            <HelpTooltipText firstLine="Click this to undo any score changes for this rule." />
          }
        >
          <IconButton
            onClick={handleReset}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
