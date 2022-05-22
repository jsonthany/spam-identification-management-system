import React, { ChangeEvent } from 'react';

export type email = {
  emailSubject: string;
  receivedTimestamp: string;
  reviewedTimestamp?: string;
  fromAddress: string;
  toAddress: string;
  id: string;
  emailBody: string;
  rawEmail?: string;
  quarantineStatus?: string;
};

export type emailList = Array<email>;

export type Nullable<T> = T | null;
export type ChangeEventAlias = ChangeEvent<
  HTMLTextAreaElement | HTMLInputElement
>;
export type StateSetterType<T> = React.Dispatch<React.SetStateAction<T>>;

const approvalStatuses = {
  denied: 'DENIED',
  allowed: 'ALLOWED',
};

export type approvalStatus =
  typeof approvalStatuses[keyof typeof approvalStatuses];

export type emailStatus = {
  id: string;
  quarantineStatus: approvalStatus;
};

export type emailApprovalList = Array<emailStatus>;
