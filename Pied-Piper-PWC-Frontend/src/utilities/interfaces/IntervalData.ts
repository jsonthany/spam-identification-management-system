import { Counts, exampleCounts, isCounts } from './Counts';
import { hasCorrectSchema, isArrayOfType } from '../helpers/typeAssertionHelpers';

export const timeUnits = ['minute', 'hour', 'day', 'month'] as const;
export type TimeUnit = typeof timeUnits[number];

export interface IntervalData {
  startTime: string;
  interval: number;
  intervalUnit: TimeUnit;
  newCounts: Counts;
  totalCounts: Counts;
}

const exampleIntervalData = {
  startTime: '',
  interval: 0,
  intervalUnit: 'minute',
  newCounts: exampleCounts,
  totalCounts: exampleCounts,
};

const dealWithRules = (nestedValue: object, key: string): boolean => {
  switch (key) {
    case 'newCounts':
    case 'totalCounts':
      return isCounts(nestedValue);
    default:
      return false;
  }
};

export function isIntervalData(value: unknown): value is IntervalData {
  const schemaCorrect = hasCorrectSchema(
    value,
    exampleIntervalData,
    () => false,
    dealWithRules,
  );
  const { intervalUnit } = value as IntervalData;
  const correctTimeUnits = timeUnits.includes(intervalUnit);
  return schemaCorrect && correctTimeUnits;
}

export function isIntervalDataList(value: unknown): value is IntervalData[] {
  return isArrayOfType<IntervalData>(value, isIntervalData);
}
