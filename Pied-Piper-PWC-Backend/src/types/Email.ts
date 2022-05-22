import { EmailAddress } from './EmailAddress';
import { ContentType } from './MIME';
import { ClassifierResult, QuarantineStatus } from './Classifier';

export interface Email {
  // first part is what an email contains
  id: string;
  fromAddressID: EmailAddress;
  toAddressID: EmailAddress | undefined;
  headers: Map<string, any>;
  body: string;
  attachments: Attachment[];
  contentType: ContentType;
  // second part is metadata we need for our own backend
  receivedTimestamp: Date;
  classifiedTimestamp?: Date;
  reviewedTimestamp?: Date;
  classifierResult?: ClassifierResult;
  quarantineStatus: QuarantineStatus | null;
  rawEmail: string;
}

export interface Attachment {
  fileName: string;
  contentType: string;
  size: number;
}