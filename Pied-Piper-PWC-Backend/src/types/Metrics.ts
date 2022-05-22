export const timeUnits = ['minute', 'hour', 'day', 'month'] as const;
export type TimeUnit = typeof timeUnits[number];

interface Counts {
  total: number;
  safe: number;
  suspect: number;
  quarantinePending: number;
  quarantineDenied: number;
  quarantineAllowed: number;
}

export interface IntervalData {
  startTime: string;
  interval: number;
  intervalUnit: TimeUnit;
  newCounts: Counts;
  totalCounts: Counts;
}
