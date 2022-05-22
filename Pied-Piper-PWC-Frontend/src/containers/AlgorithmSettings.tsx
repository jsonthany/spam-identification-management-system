// import React, { useState, useRef } from "react";
import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { RestartAlt } from '@mui/icons-material';
import RiskThresholdControls from '../components/settings/RiskThresholdControls';
import RiskRuleControlsList from '../components/settings/RiskRuleControlsList';
import ResultNotification from '../components/notifications/ResultNotification';
import ConfirmationDialog from '../components/notifications/ConfirmationDialog';
import Configuration, { MAX_SCORE_VALUE } from '../utilities/interfaces/Configuration';
import RiskRule, { riskRuleDescriptions } from '../utilities/interfaces/RiskRule';
import { Nullable } from '../utilities/interfaces/Emails';
import { emptyConfig } from '../utilities/starterData';
import LoadingBackdrop from '../components/misc/LoadingBackdrop';
import SaveButton from '../components/buttons/SaveButton';
import {
  addXListEmail,
  deleteXListEmail,
  getScannerSettings,
  getXListEmails,
  resetScannerSettings,
  updateScannerSettings,
} from '../services/settingsService';
import { XListEmail } from '../utilities/interfaces/XListEmail';
import SenderLists from '../components/settings/SenderLists';

export type XListEmails = {
  allowed: XListEmail[];
  quarantined: XListEmail[];
};
export type XListNewEmailsText = {
  allowed: string;
  quarantined: string;
}
function AlgorithmSettings() : JSX.Element {
  // STATES
  // Settings
  const [currentConfig, setCurrentConfig] = useState<Configuration>(emptyConfig);
  const [previousConfig, setPreviousConfig] = useState<Configuration>(emptyConfig);
  const [xListEmails, setXListEmails] = useState<XListEmails>(
    { allowed: [], quarantined: [] },
  );
  const [newEmailsText, setNewEmailsText] = useState<XListNewEmailsText>(
    { allowed: '', quarantined: '' },
  );
  // Config Actions
  const [isResettingToDefault, setIsResettingToDefault] = useState(false);
  // Email Actions
  const [isUsingWhitelist, setIsUsingWhitelist] = useState(true);
  const [isDoingAddEmailAction, setIsDoingAddEmailAction] = useState(true);
  const [emailIdToDelete, setEmailIdToDelete] = useState(0);
  // Snackbar
  const [successOpen, setSuccessOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const [failureMessage, setFailureMessage] = useState('Something went wrong');
  // Confirmation Dialog
  const [confirmDialogMainOpen, setConfirmDialogMainOpen] = useState(false);
  const [confirmDialogEmailsOpen, setConfirmDialogEmailsOpen] = useState(false);
  // Loading
  const [loading, setLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState('');

  // API CALLS
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const settingsResData = await getScannerSettings();
        const whitelistResData = await getXListEmails(true);
        const quarlistResData = await getXListEmails(false);
        setPreviousConfig(settingsResData);
        setCurrentConfig(settingsResData);
        setXListEmails({
          allowed: whitelistResData,
          quarantined: quarlistResData,
        });
        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setInitialLoadError(error.message);
        } else {
          setInitialLoadError('Something went wrong');
        }
      }
    };
    fetchData();
  }, []);

  // DESTRUCTURING
  type DestructuredConfig = {
    thresholds: number[],
    rules: RiskRule[],
  }
  const destructureConfig = (config: Configuration): DestructuredConfig => {
    const {
      suspectThreshold,
      quarantineThreshold,
      attachmentsAlgorithmScore,
      bodyAlgorithmScore,
      headerAlgorithmScore,
      fromAlgorithmScore,
      validSenderAddressAlgorithmScore,
      senderAddressSimilarityAlgorithmScore,
    } = config;
    const thresholds = [suspectThreshold, quarantineThreshold];
    const rules: RiskRule[] = [
      {
        name: 'attachmentAlgorithm',
        description: riskRuleDescriptions.attachmentsAlgorithmScore,
        score: attachmentsAlgorithmScore,
      },
      {
        name: 'bodyAlgorithm',
        description: riskRuleDescriptions.bodyAlgorithmScore,
        score: bodyAlgorithmScore,
      },
      {
        name: 'headerAlgorithm',
        description: riskRuleDescriptions.headerAlgorithmScore,
        score: headerAlgorithmScore,
      },
      {
        name: 'fromAlgorithm',
        description: riskRuleDescriptions.fromAlgorithmScore,
        score: fromAlgorithmScore,
      },
      {
        name: 'validSenderAddressAlgorithm',
        description: riskRuleDescriptions.validSenderAddressAlgorithmScore,
        score: validSenderAddressAlgorithmScore,
      },
      {
        name: 'senderAddressSimilarityAlgorithm',
        description: riskRuleDescriptions.senderAddressSimilarityAlgorithmScore,
        score: senderAddressSimilarityAlgorithmScore,
      },
    ];
    return { thresholds, rules };
  };

  const {
    thresholds: currentThresholds,
    rules: currentRules,
  } = destructureConfig(currentConfig);
  const {
    thresholds: previousThresholds,
    rules: previousRules,
  } = destructureConfig(previousConfig);
  const saveButtonDisable = initialLoadError !== '';

  // HANDLERS
  const setThresholds = (newThresholds: number[]): void => {
    const [susThreshold, quarThreshold] = newThresholds;
    const newConfig = {
      ...currentConfig,
      suspectThreshold: susThreshold,
      quarantineThreshold: quarThreshold,
    };
    setCurrentConfig(newConfig);
  };

  type ConfigRules = Omit<Configuration, 'suspectThreshold' | 'quarantineThreshold'>;
  const riskRulesToConfigFormat = (newRules: RiskRule[]): ConfigRules => {
    const configRules: ConfigRules = {
      attachmentsAlgorithmScore: 0,
      bodyAlgorithmScore: 0,
      headerAlgorithmScore: 0,
      fromAlgorithmScore: 0,
      validSenderAddressAlgorithmScore: 0,
      senderAddressSimilarityAlgorithmScore: 0,
    };
    newRules.forEach((rule) => {
      switch (rule.name) {
        case 'attachmentAlgorithm':
          configRules.attachmentsAlgorithmScore = rule.score;
          break;
        case 'bodyAlgorithm':
          configRules.bodyAlgorithmScore = rule.score;
          break;
        case 'headerAlgorithm':
          configRules.headerAlgorithmScore = rule.score;
          break;
        case 'fromAlgorithm':
          configRules.fromAlgorithmScore = rule.score;
          break;
        case 'validSenderAddressAlgorithm':
          configRules.validSenderAddressAlgorithmScore = rule.score;
          break;
        case 'senderAddressSimilarityAlgorithm':
          configRules.senderAddressSimilarityAlgorithmScore = rule.score;
          break;
        default:
          throw new Error(`Unsupported risk rule name ${rule.name}`);
      }
    });
    return configRules;
  };

  const setRules = (newRules: RiskRule[]): void => {
    const {
      attachmentsAlgorithmScore,
      bodyAlgorithmScore,
      headerAlgorithmScore,
      fromAlgorithmScore,
      validSenderAddressAlgorithmScore,
      senderAddressSimilarityAlgorithmScore,
    } = riskRulesToConfigFormat(newRules);
    setCurrentConfig({
      ...currentConfig,
      attachmentsAlgorithmScore,
      bodyAlgorithmScore,
      headerAlgorithmScore,
      fromAlgorithmScore,
      validSenderAddressAlgorithmScore,
      senderAddressSimilarityAlgorithmScore,
    });
  };

  const handleChangeNewEmailText = (whitelist: boolean) => (newEmail: string): void => {
    const newState = whitelist
      ? {
        ...newEmailsText,
        allowed: newEmail,
      }
      : {
        ...newEmailsText,
        quarantined: newEmail,
      };
    setNewEmailsText(newState);
  };

  const errorHandler = (error: unknown): void => {
    setLoading(false);
    if (error instanceof Error) {
      setFailureMessage(error.message);
    } else if (typeof error === 'string') {
      setFailureMessage(error);
    } else {
      setFailureMessage('Something went wrong');
    }
    setFailureOpen(true);
  };

  const successHandler = (): void => {
    setLoading(false);
    setSuccessOpen(true);
  };

  const handleClickSubmit = (resetToDefault: boolean) => (event: React.MouseEvent): void => {
    event.preventDefault();
    setIsResettingToDefault(resetToDefault);
    setConfirmDialogMainOpen(true);
  };

  const handleClickChangeEmail = (
    whitelist: boolean,
    addAction: boolean,
    id?: number,
  ) => (
    event: React.MouseEvent,
  ): void => {
    event.preventDefault();
    if (addAction) {
      const newEmail = whitelist ? newEmailsText.allowed : newEmailsText.quarantined;
      if (!newEmail) return;
    }
    setIsUsingWhitelist(whitelist);
    setIsDoingAddEmailAction(addAction);
    if (id != null) setEmailIdToDelete(id);
    setConfirmDialogEmailsOpen(true);
  };

  const handleConfirmSettingsChange = async (): Promise<void> => {
    setConfirmDialogMainOpen(false);
    setLoading(true);
    let responseData: Nullable<Configuration> = null;
    try {
      responseData = isResettingToDefault
        ? await resetScannerSettings()
        : await updateScannerSettings(currentConfig);
    } catch (error) {
      errorHandler(error);
      return;
    }
    setPreviousConfig(responseData as Configuration);
    setCurrentConfig(responseData as Configuration);
    successHandler();
  };

  const handleConfirmEmailChange = async (): Promise<void> => {
    setConfirmDialogEmailsOpen(false);
    setLoading(true);

    const validateEmail = (emailAddress: string): boolean => {
      const re = /\S+@\S+\.\S+/;
      return re.test(emailAddress);
    };

    const addEmail = async (): Promise<Nullable<XListEmails>> => {
      const newEmailText = isUsingWhitelist
        ? newEmailsText.allowed
        : newEmailsText.quarantined;
      let responseData: Nullable<XListEmail> = null;
      try {
        if (!validateEmail(newEmailText)) {
          errorHandler('A clearly invalid email address was provided.');
          return null;
        }
        responseData = await addXListEmail(newEmailText, isUsingWhitelist);
      } catch (error) {
        errorHandler(error);
        return null;
      }
      return isUsingWhitelist
        ? {
          ...xListEmails,
          allowed: [...xListEmails.allowed, responseData],
        }
        : {
          ...xListEmails,
          quarantined: [...xListEmails.quarantined, responseData],
        };
    };

    const deleteEmail = async (): Promise<Nullable<XListEmails>> => {
      try {
        await deleteXListEmail(emailIdToDelete, isUsingWhitelist);
      } catch (error) {
        errorHandler(error);
        return null;
      }
      return isUsingWhitelist
        ? {
          ...xListEmails,
          allowed: xListEmails.allowed.filter(
            (email) => email.id !== emailIdToDelete,
          ),
        }
        : {
          ...xListEmails,
          quarantined: xListEmails.quarantined.filter(
            (email) => email.id !== emailIdToDelete,
          ),
        };
    };

    const newState = isDoingAddEmailAction ? await addEmail() : await deleteEmail();
    if (newState != null) {
      setXListEmails(newState);
      if (isDoingAddEmailAction) {
        if (isUsingWhitelist) {
          setNewEmailsText({ ...newEmailsText, allowed: '' });
        } else {
          setNewEmailsText({ ...newEmailsText, quarantined: '' });
        }
      }
      successHandler();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container direction="column" spacing={0} px={2}>
        <Grid
          container
          item
          direction="row"
          spacing={0}
          justifyContent="space-between"
          alignItems="flex-end"
          pb={2}
        >
          <Grid item>
            <Typography variant="h6">Scanner Settings</Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              alignItems="flex-end"
            >
              <Grid item>
                <Button
                  startIcon={<RestartAlt />}
                  onClick={handleClickSubmit(true)}
                >
                  Reset To Default
                </Button>
              </Grid>
              <Grid item>
                <SaveButton
                  disabled={saveButtonDisable}
                  handleClick={handleClickSubmit(false)}
                  loading={loading && !saveButtonDisable}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box sx={{ position: 'relative' }}>
          <RiskThresholdControls
            thresholds={currentThresholds}
            maxThreshold={MAX_SCORE_VALUE}
            previousThresholds={previousThresholds}
            setThresholds={setThresholds}
          />
          <Divider sx={{ my: 2 }} />
          <RiskRuleControlsList
            rules={currentRules}
            maxRuleScore={MAX_SCORE_VALUE}
            previousRules={previousRules}
            setRules={setRules}
          />
          <Divider sx={{ my: 2 }} />
          <SenderLists
            emailLists={xListEmails}
            newEmailsText={newEmailsText}
            handleClickChangeEmail={handleClickChangeEmail}
            setNewEmailText={handleChangeNewEmailText}
          />
          <LoadingBackdrop
            loading={loading}
            initialLoadError={initialLoadError}
          />
        </Box>
        <Box p={1} />
      </Grid>
      <ResultNotification
        success
        open={successOpen}
        setOpen={setSuccessOpen}
        autoHideDuration={3}
        description="Settings changes saved"
      />
      <ResultNotification
        success={false}
        open={failureOpen}
        setOpen={setFailureOpen}
        autoHideDuration={3}
        description={failureMessage}
      />
      <ConfirmationDialog
        open={confirmDialogMainOpen}
        contentText="Confirm settings change?"
        setOpen={setConfirmDialogMainOpen}
        handleConfirm={handleConfirmSettingsChange}
      />
      <ConfirmationDialog
        open={confirmDialogEmailsOpen}
        contentText={`Confirm ${isDoingAddEmailAction ? 'new' : 'delete'} email?`}
        setOpen={setConfirmDialogEmailsOpen}
        handleConfirm={handleConfirmEmailChange}
      />
    </Box>
  );
}

export default AlgorithmSettings;
