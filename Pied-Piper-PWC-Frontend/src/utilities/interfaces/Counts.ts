import { hasCorrectSchema } from '../helpers/typeAssertionHelpers';

export interface Counts {
  safe: number;
  suspect: number;
  quarantine: number;
}

export const exampleCounts = {
  safe: 0,
  suspect: 0,
  quarantine: 0,
};

export function isCounts(value: unknown): value is Counts {
  return hasCorrectSchema(value, exampleCounts);
}
