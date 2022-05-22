import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';
import RiskRule from '../../utilities/interfaces/RiskRule';
import RiskRuleControlsElement from './RiskRuleControlsElement';
import InfoButton from '../buttons/InfoButton';

type RulesControlsType = {
  rules: RiskRule[];
  previousRules: RiskRule[];
  maxRuleScore: number;
  setRules: (newRules: RiskRule[]) => void;
}

export default function RiskRuleControlsList(props: RulesControlsType) : JSX.Element {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const {
    rules, previousRules, maxRuleScore, setRules,
  } = props;
  const previousRulesDictionary = Object.fromEntries(
    previousRules.map(
      (e): [string, RiskRule] => [e.name, e],
    ),
  );

  const handleRuleChange = (key: string) => (newValue: number) => {
    const updatedRules = rules.map((rule) => {
      if (rule.name === key) {
        return { ...rule, score: newValue };
      }
      return rule;
    });
    setRules(updatedRules);
  };

  const handleRuleReset = (key: string) => (event: React.MouseEvent) => {
    event.preventDefault();

    if (key in previousRulesDictionary) {
      const oldRule = previousRulesDictionary[key];
      const updatedRules = rules.map((rule) => {
        if (rule.name === key) {
          return oldRule;
        }
        return rule;
      });
      setRules(updatedRules);
    }
  };

  const handleInfoDialogOpen = (): void => {
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = (): void => {
    setInfoDialogOpen(false);
  };

  return (
    <>
      <Paper
        sx={{ p: 2 }}
      >
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
              Risk Rules
            </Typography>
          </Grid>
          <Grid item>
            <InfoButton handleClick={handleInfoDialogOpen} />
          </Grid>
        </Grid>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={0.5}
          pb={2}
        >
          {rules.map((rule) => (
            <RiskRuleControlsElement
              key={rule.name}
              rule={rule}
              maxRuleScore={maxRuleScore}
              handleChange={handleRuleChange(rule.name)}
              handleReset={handleRuleReset(rule.name)}
            />
          ))}
        </Grid>
      </Paper>
      <Dialog
        open={infoDialogOpen}
        onClose={handleInfoDialogClose}
      >
        <DialogTitle>How Risk Rules Work</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography mb={2}>
              An incoming email is checked against each rule.
              <br />
              Failing a rule adds to the overall risk score.
            </Typography>
            <Typography my={2}>
              Each rule has a percentage weight, which you can set using the input box on the right.
              <br />
              Higher weights mean failures add more to the overall risk score,
              making it more likely to be classified as Suspect or Quarantine.
            </Typography>
            <Typography mt={2}>
              Risk rule weights can be set from 0 to 100.
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
