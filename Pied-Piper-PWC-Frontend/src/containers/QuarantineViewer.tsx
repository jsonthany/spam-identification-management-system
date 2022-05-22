import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import EmailTable from '../components/viewer/Table';
import ResultNotification from '../components/notifications/ResultNotification';
import ConfirmationDialog from '../components/notifications/ConfirmationDialog';
import LoadingBackdrop from '../components/misc/LoadingBackdrop';
import { approveEmail } from '../services/emailService';
import { emailApprovalList } from '../utilities/interfaces/Emails';
import EmailDisplay from '../components/viewer/EmailDisplay';

function QuarantineViewer(): JSX.Element {
  const [successOpen, setSuccessOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const [failureMessage, setFailureMessage] = useState('Something went wrong');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState('');
  const [emailActionList, setEmailActionList] = useState<emailApprovalList>([]);
  const [currentEmailId, setCurrentEmailId] = useState('');

  useEffect(() => {
    const url = window.location.href;
    const n = url.lastIndexOf('/');
    const set = url.substring(n + 1);
    if (set === 'view') setCurrentEmailId('');
    else setCurrentEmailId(set);
  }, []);

  const handleApproval = (emails: emailApprovalList): void => {
    setEmailActionList(emails);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSettingsChange = async (): Promise<void> => {
    setConfirmDialogOpen(false);
    setLoading(true);
    try {
      await approveEmail(emailActionList);
    } catch (e) {
      setLoading(false);
      if (e instanceof Error) {
        setFailureMessage(e.message);
      } else {
        setFailureMessage('Something went wrong');
        setInitialLoadError('Something went wrong');
      }
      setFailureOpen(true);
      return;
    }

    setEmailActionList([]);
    setLoading(false);
    setSuccessOpen(true);
  };

  return (
    <Box>
      {currentEmailId.length ? (
        <EmailDisplay
          currentEmailId={currentEmailId}
          setCurrentEmailId={setCurrentEmailId}
          handleApproval={handleApproval}
        />
      ) : (
        <EmailTable
          handleApproval={handleApproval}
          setCurrentEmailId={setCurrentEmailId}
        />
      )}
      <ResultNotification
        success
        open={successOpen}
        setOpen={setSuccessOpen}
        autoHideDuration={3}
        description="Email quarantine changes saved"
      />
      <ResultNotification
        success={false}
        open={failureOpen}
        setOpen={setFailureOpen}
        autoHideDuration={3}
        description={failureMessage}
      />
      <ConfirmationDialog
        open={confirmDialogOpen}
        contentText="Confirm change in email quarantine status?"
        setOpen={setConfirmDialogOpen}
        handleConfirm={handleConfirmSettingsChange}
      />
      <LoadingBackdrop loading={loading} initialLoadError={initialLoadError} />
    </Box>
  );
}

export default QuarantineViewer;
