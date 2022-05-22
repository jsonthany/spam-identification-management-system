import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';
import { AddCircleOutline, Delete } from '@mui/icons-material';
import XEmailControlsList from './XEmailControlsList';
import { XListEmails, XListNewEmailsText } from '../../containers/AlgorithmSettings';
import InfoButton from '../buttons/InfoButton';

type SenderListsProps = {
  emailLists: XListEmails;
  newEmailsText: XListNewEmailsText;
  handleClickChangeEmail: (
    whitelist: boolean, addAction: boolean, id?: number
  ) => (event: React.MouseEvent) => void;
  setNewEmailText: (whitelist: boolean) => (newEmailText: string) => void;
};
export default function SenderLists(props: SenderListsProps): JSX.Element {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const {
    emailLists,
    newEmailsText,
    handleClickChangeEmail,
    setNewEmailText,
  } = props;

  const handleAddEmail = (
    whitelist: boolean,
  ): (event: React.MouseEvent) => void => handleClickChangeEmail(whitelist, true);

  const handleDeleteEmail = (
    whitelist: boolean,
  ) => (id: number) => handleClickChangeEmail(whitelist, false, id);

  const handleInfoDialogOpen = (): void => {
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = (): void => {
    setInfoDialogOpen(false);
  };

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
              sx={{ fontSize: '1.1em' }}
            >
              Sender Lists
            </Typography>
          </Grid>
          <Grid item>
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
          }}
          justifyContent="center"
          alignItems="flex-start"
        >
          <Grid item xs={4} sm={4} md={6}>
            <XEmailControlsList
              title="Allowed"
              emails={emailLists.allowed}
              newEmailText={newEmailsText.allowed}
              listTooltip="Emails from these senders are always safe."
              handleNewEmail={handleAddEmail(true)}
              handleDeleteEmail={handleDeleteEmail(true)}
              setNewEmailText={setNewEmailText(true)}
            />
          </Grid>
          <Grid item xs={4} sm={4} md={6}>
            <XEmailControlsList
              title="Quarantined"
              emails={emailLists.quarantined}
              newEmailText={newEmailsText.quarantined}
              listTooltip="Emails from these senders are always quarantined."
              handleNewEmail={handleAddEmail(false)}
              handleDeleteEmail={handleDeleteEmail(false)}
              setNewEmailText={setNewEmailText(false)}
            />
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={infoDialogOpen} onClose={handleInfoDialogClose}>
        <DialogTitle>How Email Lists Work</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography mb={2}>
              Incoming emails are checked against these lists of email addresses.
            </Typography>
            <Typography my={2}>
              Any email from an address on the allowed list is automatically considered safe.
              <br />
              Safe emails are sent on to their original recipients.
            </Typography>
            <Typography my={2}>
              Any email from an address on the quarantined list is automatically quarantined.
              This is true even if the email is also in the allowed list.
              <br />
              Quarantined emails are held for administrator review.
            </Typography>
            <Typography my={2}>
              You can use an asterisk (*) in an email address as a wildcard to match anything.
              <br />
              For example, the address &quot;*@spam.com&quot;
              matches any email from a &quot;spam.com&quot; address.
            </Typography>
            <Typography mt={2}>
              You can add a new email address by typing it
              in the &quot;New Email&quot; text entry box
              {' and clicking the '}
              <AddCircleOutline fontSize="small" />
              {' button.'}
              <br />
              {'You can delete an email address by clicking the '}
              <Delete fontSize="small" />
              {' button to the right of the address.'}
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
