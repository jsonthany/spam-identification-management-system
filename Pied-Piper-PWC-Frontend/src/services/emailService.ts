// import http, { authHeader } from './httpService';
import http from './httpService';
import {
  email,
  emailList,
  emailApprovalList,
} from '../utilities/interfaces/Emails';

const path = '';
const apiEndpoint = window.apiUrl + path;

export async function getEmail(id: string): Promise<email> {
  const response = await http.get(
    `${apiEndpoint}/emails/${encodeURIComponent(id)}`,
  );
  if (response.data) {
    return response.data;
  }
  throw new Error(response.statusText);
}

export async function approveEmail(
  emails: emailApprovalList,
): Promise<unknown> {
  const response = await http.patch(`${apiEndpoint}/emails`, emails);
  if (response.data) return response.data;
  throw new Error(response.statusText);
}

type paginatedEmails = {
  data: emailList;
  page: number;
  numEmails: number;
};

export async function getQuarantinedEmails(
  page: number,
  pageSize: number,
  order: string,
  orderBy: string,
): Promise<paginatedEmails> {
  const response = await http.get(`${apiEndpoint}/emails`, {
    params: {
      page: page.toString(),
      pageSize: pageSize.toString(),
      order,
      orderBy,
      quarantineStatus: 'PENDING',
    },
  });
  if (response.data) {
    return response.data;
  }
  throw new Error(response.statusText);
}

export async function getEmails(): Promise<emailList> {
  const response = await http.get(`${apiEndpoint}/emails`);
  if (response.data) {
    return response.data;
  }
  throw new Error(response.statusText);
}

export interface ClassifierResult {
  classification: string;
  riskScore: number;
}

export interface AnalyzeResBody {
  classifiedTimestamp?: string;
  emailId: string;
  classifierResult: ClassifierResult;
}

export async function analyzeEmail(
  rawEmailString: string,
): Promise<AnalyzeResBody> {
  const response = await http.post(`${apiEndpoint}/analyze`, {
    raw: rawEmailString,
  });
  if (response.data) return response.data;
  throw new Error(response.statusText);
}
