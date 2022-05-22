import { TimeUnit } from '../utilities/interfaces/IntervalData';
import http from './httpService';

const path = '/metrics';
const apiEndpoint = window.apiUrl + path;

export type MetricsQuery = {
  startTime: string;
  endTime?: string;
  interval: string;
  intervalUnit: TimeUnit;
};

export interface classifierMetricsInterface {
  SAFE: number;
  SUSPECT: number;
  QUARANTINE: number;
}

export interface timeFrameInterface {
  oneDay: classifierMetricsInterface;
  oneWeek: classifierMetricsInterface;
  oneMonth: classifierMetricsInterface;
}

interface classificationData {
  classificationCount: timeFrameInterface;
  averageRiskScores: timeFrameInterface;
}

export async function getClassificationData(): Promise<classificationData> {
  const response = await http.get(`${apiEndpoint}/classificationData`);
  if (response.data) {
    return response.data;
  }
  throw new Error(response.statusText);
}

type falsePositive = Array<string>;

export type falsePositivesArray = Array<falsePositive>;

interface quarantineData {
  totalPending: number;
  falsePositives: falsePositivesArray;
}

export async function getQuarantineData(): Promise<quarantineData> {
  const response = await http.get(`${apiEndpoint}/quarantineData`);
  if (response.data) {
    return response.data;
  }
  throw new Error(response.statusText);

  // const testSuccess = true;
  // const delayTime = testSuccess ? 500 : 3000;
  // await sleep(delayTime);
  // if (testSuccess) {
  //   const startDate = new Date(query.startTime);
  //   const nowDate = new Date();
  //   const dayDuration = 24 * 60 * 60 * 1000;
  //   const daysAgo = Math.round((nowDate.getTime() - startDate.getTime()) / dayDuration);
  //   switch (daysAgo) {
  //     case 1:
  //       return starterDashboardState.counts1Day;
  //     case 7:
  //       return (query.interval === '1' && query.intervalUnit === 'hour')
  //         ? starterDashboardState.timeSeries7Day
  //         : starterDashboardState.counts7Day;
  //     case 30:
  //       return (query.interval === '3' && query.intervalUnit === 'hour')
  //         ? starterDashboardState.timeSeries30Day
  //         : starterDashboardState.counts30Day;
  //     default:
  //       throw new Error(`Could not get data for ${daysAgo} days ago`);
  //   }
  // }
}
