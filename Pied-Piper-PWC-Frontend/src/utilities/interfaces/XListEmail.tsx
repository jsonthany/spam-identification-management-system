import { isArray, isObject } from '../helpers/typeAssertionHelpers';
import { Nullable } from './Emails';

export interface XListEmail {
  id: number;
  email: string;
}

export function makeXListEmails(responseData: unknown): Nullable<XListEmail[]> {
  if (isObject(responseData)) {
    if ('rows' in responseData) {
      const emailsData: unknown = (responseData as Record<string, unknown>).rows;
      if (isArray(emailsData)) {
        const gbEmailsList = emailsData
          .map((value) => {
            if (isArray(value)) {
              const [id, email] = value;
              if (typeof id === 'number' && typeof email === 'string') {
                return { id, email };
              }
            }
            return null;
          })
          .filter((value) => value != null);
        if (gbEmailsList.length > 0) {
          return gbEmailsList as XListEmail[];
        }
        return null;
      }
    }
  }
  return null;
}
