import React from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline } from '@mui/icons-material';
import { TextField, Tooltip } from '@mui/material';
import { XListEmail } from '../../utilities/interfaces/XListEmail';
import XEmailControlsElement from './XEmailControlsElement';
import { ChangeEventAlias } from '../../utilities/interfaces/Emails';
import HelpTooltipText from '../misc/HelpTooltipText';

type XEmailControlsListProps = {
  title: string;
  emails: XListEmail[];
  newEmailText: string;
  listTooltip: string;
  handleNewEmail: (event: React.MouseEvent) => void;
  handleDeleteEmail: (id: number) => (event: React.MouseEvent) => void;
  setNewEmailText: (emailText: string) => void;
};
export default function XEmailControlsList(props: XEmailControlsListProps) : JSX.Element {
  const {
    title, emails, newEmailText, listTooltip, handleNewEmail, handleDeleteEmail, setNewEmailText,
  } = props;

  const handleChangeEmailText = (event: ChangeEventAlias): void => {
    event.preventDefault();
    setNewEmailText(event.target.value);
  };

  return (
    <Paper>
      <Typography
        gutterBottom
        sx={{
          fontSize: '1.1em',
        }}
        p={1}
      >
        {title}
      </Typography>
      <Grid
        container
        direction="row"
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={3} sm={6.5} md={10}>
          <Tooltip
            title={(
              <HelpTooltipText
                firstLine={(
                  <>
                    Enter a new email address here.
                    <br />
                    {listTooltip}
                  </>
            )}
              />
          )}
            placement="top"
          >
            <TextField
              fullWidth
              size="small"
              id={`newEmail-${title}`}
              label="New email"
              value={newEmailText}
              onChange={handleChangeEmailText}
            />
          </Tooltip>
        </Grid>
        <Grid
          item
          xs={0.5}
          justifyContent="center"
        >
          <Tooltip
            title={<HelpTooltipText firstLine="Click this to add a new address to this list." />}
            placement="left"
          >
            <IconButton onClick={handleNewEmail}>
              <AddCircleOutline />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        {emails.map((email) => (
          <XEmailControlsElement
            emailData={email}
            handleEmailDelete={handleDeleteEmail(email.id)}
          />
        ))}
      </Grid>
    </Paper>
  );
}
