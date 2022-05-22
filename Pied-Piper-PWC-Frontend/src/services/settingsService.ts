import { AxiosResponse } from 'axios';
import http from './httpService';
import Configuration, {
  configHasValidNumbers,
  generateConfigWithValidNumbers,
  isConfiguration,
} from '../utilities/interfaces/Configuration';
import { makeXListEmails, XListEmail } from '../utilities/interfaces/XListEmail';
import { Nullable } from '../utilities/interfaces/Emails';
import { hasKey, isObject } from '../utilities/helpers/typeAssertionHelpers';
import getValueForKeysRecursively from '../utilities/helpers/getValueForKeysRecursively';

const path = '/configuration';
const apiEndpoint = window.apiUrl + path;

export async function updateScannerSettings(
  updatedSettings: Configuration,
): Promise<Configuration> {
  const response = await http.patch(
    `${apiEndpoint}`,
    { data: updatedSettings },
  );
  if (response.data) {
    const resData = response.data;
    if (isConfiguration(resData)) {
      return resData;
    }
    if ('err' in resData) {
      throw new Error(resData?.err);
    }
  }
  throw new Error('The changes could not be saved.');
}

export async function getScannerSettings(): Promise<Configuration> {
  const errorMessage = 'The server is not sending the current settings properly.';
  const response = await http.get(`${apiEndpoint}`);
  if (response.data) {
    const resData = response.data;
    if (isConfiguration(resData)) {
      if (configHasValidNumbers(resData)) return resData;
      try {
        return await updateScannerSettings(generateConfigWithValidNumbers(resData));
      } catch {
        throw new Error(errorMessage);
      }
    }
  }
  throw new Error(errorMessage);
}

export async function resetScannerSettings(): Promise<Configuration> {
  const response = await http.patch(`${apiEndpoint}/reset`);
  if (response.data) {
    const resData = response.data;
    if (isConfiguration(resData)) {
      return resData;
    }
    if ('err' in resData) {
      throw new Error(resData?.err);
    }
  }
  throw new Error('The server did not send the default configuration properly.');
}

const getXListEndpoint = (whitelist: boolean): string => (whitelist ? 'whitelistemails' : 'quarantinedemails');
const getXListDescription = (whitelist: boolean): string => (whitelist ? 'allowed' : 'quarantined');

export async function getXListEmails(whitelist: boolean): Promise<XListEmail[]> {
  const xListEndpoint = getXListEndpoint(whitelist);
  const response = await http.get(
    `${apiEndpoint}/${xListEndpoint}`,
  );
  if (response.data) {
    if (response.status === 200) {
      const emailsData = makeXListEmails(response.data);
      if (emailsData) return emailsData;
    } else if ('err' in response.data) {
      throw new Error(response.data?.err);
    }
  }
  throw new Error(`The server is not sending the ${getXListDescription(whitelist)} emails properly.`);
}

export async function addXListEmail(emailAddress: string, whitelist: boolean): Promise<XListEmail> {
  const defaultErrorMessage = `The email could not be added to the ${getXListDescription(whitelist)} emails properly.`;
  const xListEndpoint = getXListEndpoint(whitelist);
  let response: Nullable<AxiosResponse<unknown>> = null;
  try {
    response = await http.put(
      `${apiEndpoint}/${xListEndpoint}`,
      { email: emailAddress },
    );
  } catch (error) {
    const errorMessage = getValueForKeysRecursively(error, ['response', 'data', 'error']);
    if (typeof errorMessage === 'string') {
      throw new Error(errorMessage);
    }
    throw new Error(defaultErrorMessage);
  }

  if (response != null) {
    switch (response.status) {
      case 200:
        if (response.data) {
          const emailsData = makeXListEmails(response.data);
          if (emailsData) return emailsData[0];
        }
        break;
      default:
        if (response.data && isObject(response.data)) {
          const resData = response.data;
          if (hasKey(resData, 'error')) {
            if (typeof resData.error === 'string') throw new Error(resData.error);
          }
          throw new Error(`Server sent a status ${response.status} code, but we don't know what to do with that.`);
        }
    }
  }
  throw new Error(defaultErrorMessage);
}

export async function deleteXListEmail(id: number, whitelist: boolean): Promise<void> {
  const xListEndpoint = getXListEndpoint(whitelist);
  const response = await http.delete(
    `${apiEndpoint}/${xListEndpoint}/${id}`,
  );
  if (response.status === 204) {
    return;
  }
  if (response.data && 'err' in response.data) {
    throw new Error(response.data?.err);
  }
  throw new Error(`The email could not be deleted from the ${getXListDescription(whitelist)} emails properly.`);
}
