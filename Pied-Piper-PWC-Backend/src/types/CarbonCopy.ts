import { EmailAddress } from './EmailAddress';
import { Email } from './Email';

export enum CarbonCopyField {
  CC = 'CC',
  BCC = 'BCC',
}

export interface CarbonCopy {
  id: string;
  emailId: Email['id'];
  addressId: EmailAddress['id'];
  type: CarbonCopyField;
}
