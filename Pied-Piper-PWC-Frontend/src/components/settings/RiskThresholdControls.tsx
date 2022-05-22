import React, { SyntheticEvent, useState } from 'react';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip,
} from '@mui/material';
import Button from '@mui/material/Button';
import UndoButton from '../buttons/UndoButton';
import capNumberValue from '../../utilities/helpers/capNumberValue';
import SpinnerInput from '../misc/SpinnerInput';
import InfoButton from '../buttons/InfoButton';
import HelpTooltipText from '../misc/HelpTooltipText';

type ThresholdControlsProps = {
  thresholds: number[];
  previousThresholds: number[];
  maxThreshold: number;
  setThresholds: (newThresholds: number[]) => void;
}

function validateThresholds(thresholds: number[], maxThreshold: number): number[] {
  const [susThreshold, quarThreshold] = thresholds;
  return [
    capNumberValue(susThreshold, 0, maxThreshold - 1),
    capNumberValue(quarThreshold, 0, maxThreshold),
  ];
}

export default function RiskThresholdControls(props: ThresholdControlsProps) : JSX.Element {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const {
    thresholds, maxThreshold, previousThresholds, setThresholds,
  } = props;
  const [suspiciousThreshold, quarantineThreshold] = validateThresholds(thresholds, maxThreshold);

  type EventsAlias = Event | SyntheticEvent<Element, Event>;
  const handleSliderChange = (event: EventsAlias, value: number | number[]) : void => {
    event.preventDefault();
    if (typeof value !== 'number') {
      setThresholds(value);
    }
  };

  const handleSpinnerChange = (index: number) => (value: number) : void => {
    let newThresholds = [...thresholds];
    newThresholds[index] = value;
    newThresholds = newThresholds.sort((a, b) => a - b);
    setThresholds(newThresholds);
  };

  const handleReset = (event: React.MouseEvent): void => {
    event.preventDefault();
    setThresholds(previousThresholds);
  };

  const handleInfoDialogOpen = (): void => {
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = (): void => {
    setInfoDialogOpen(false);
  };

  // TODO add getAriaLabel and getAriaValueText to slider
  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Grid
          container
          direction="row"
          spacing={0}
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Grid item>
            <Typography
              gutterBottom
              sx={{
                fontSize: '1.1em',
              }}
            >
              Risk Thresholds
            </Typography>
          </Grid>
          <Grid item>
            {/* <IconButton onClick={handleInfoDialogOpen}> */}
            {/*  <HelpOutline /> */}
            {/* </IconButton> */}
            <InfoButton handleClick={handleInfoDialogOpen} />
          </Grid>
        </Grid>
        <Grid
          container
          item
          direction="row"
          spacing={{ xs: 2, md: 3 }}
          columns={{
            xs: 4,
            sm: 8,
            md: 12,
            lg: 12,
          }}
          justifyContent="center"
          alignItems="center"
        >
          <Grid
            item
            xs={4}
            sm={8}
            md={6}
            lg={7}
          >
            <Tooltip
              title={(
                <HelpTooltipText
                  firstLine="Use this slider to change the Suspect/Quarantine risk thresholds."
                />
              )}
              placement="bottom"
              followCursor
            >
              <Slider
                aria-label="Risk threshold slider"
                valueLabelDisplay="auto"
                onChange={handleSliderChange}
                value={thresholds}
                min={0}
                max={maxThreshold}
                step={1}
                track={false}
              />
            </Tooltip>
          </Grid>
          <Grid
            container
            item
            xs={2}
            sm={1.5}
            md={2}
            lg={1.5}
            justifyContent="center"
          >
            <SpinnerInput
              size="small"
              id="threshold-suspicious"
              label="Suspect"
              tooltipTitle={<HelpTooltipText firstLine="Enter the Suspect threshold here by typing or using the buttons." />}
              value={suspiciousThreshold}
              minValue={0}
              maxValue={maxThreshold}
              handler={handleSpinnerChange(0)}
              sx={{ minWidth: '4em', maxWidth: '7em' }}
            />
          </Grid>
          <Grid
            container
            item
            xs={2}
            sm={1.5}
            md={2}
            lg={1.5}
            justifyContent="center"
          >
            <SpinnerInput
              size="small"
              id="threshold-quarantine"
              label="Quarantine"
              tooltipTitle={<HelpTooltipText firstLine="Enter the Quarantine threshold here by typing or using the buttons." />}
              value={quarantineThreshold}
              minValue={0}
              maxValue={maxThreshold}
              handler={handleSpinnerChange(1)}
              sx={{ minWidth: '4em', maxWidth: '7em' }}
            />
          </Grid>
          <Grid
            container
            item
            xs={2}
            sm={1.5}
            md={1.5}
            justifyContent="center"
          >
            <UndoButton
              handleUndo={handleReset}
              tooltipTitle={<HelpTooltipText firstLine="Click this to undo any threshold changes." />}
            />
          </Grid>
        </Grid>
      </Paper>
      <Dialog
        open={infoDialogOpen}
        onClose={handleInfoDialogClose}
      >
        <DialogTitle>How Risk Thresholds Work</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography mb={2}>
              An incoming email is checked against each rule, and then given a risk score.
            </Typography>
            <Typography my={2}>
              Any email with a risk score less than the Suspect threshold is Safe.
              <br />
              Safe emails are sent on to their original recipients.
            </Typography>
            <Typography my={2}>
              Any email with a risk score greater than the Quarantine threshold is Quarantined.
              <br />
              Quarantined emails are held for administrator review.
            </Typography>
            <Typography my={2}>
              Any email with a risk score between the two thresholds is Suspect.
              <br />
              Suspect emails are sent on, but with a warning attached.
            </Typography>
            <Typography mt={2}>
              Thresholds can be set from 0 to 100 using the sliders or the input boxes.
              <br />
              The suspect threshold cannot be larger than the quarantine threshold.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInfoDialogClose}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
