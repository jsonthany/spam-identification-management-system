import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from 'recharts';
import GraphCard from './GraphCard';
import { falsePositivesArray } from '../../services/metricsService';
/* eslint-disable */

// Source: https://github.com/mui/material-ui/blob/master/docs/data/material/getting-started/templates/dashboard/Dashboard.js

type LineChartDataType = {
  time: string;
  amount?: number;
};

function createData(time: string, amount?: number): LineChartDataType {
  return { time, amount };
}
type inputData = Array<LineChartDataType>;
const data = [
  {
    time: 'Sun',
    amount: 4000,
  },
  {
    time: 'Mon',
    amount: 3000,
  },
];

type LineGraphProps = {
  metrics?: falsePositivesArray;
  timeFrame: number;
  handleClick?: (event: React.MouseEvent) => void;
};

type status = {
  PENDING: number;
  DENIED: number;
  APPROVED: number;
};

type dates = {
  Jan: status;
  Feb: status;
  Mar: status;
  Apr: status;
  May: status;
  Jun: status;
  Jul: status;
  Aug: status;
  Sep: status;
  Oct: status;
  Nov: status;
  Dec: status;
};

type date = keyof dates;
type datesArrayType = Array<keyof dates>;
const datesArray: datesArrayType = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const defaultStatus: status = {
  PENDING: 0,
  DENIED: 0,
  APPROVED: 0,
};
const defaultData: dates = {
  Jan: defaultStatus,
  Feb: defaultStatus,
  Mar: defaultStatus,
  Apr: defaultStatus,
  May: defaultStatus,
  Jun: defaultStatus,
  Jul: defaultStatus,
  Aug: defaultStatus,
  Sep: defaultStatus,
  Oct: defaultStatus,
  Nov: defaultStatus,
  Dec: defaultStatus,
};

export default function LineGraph(props: LineGraphProps): JSX.Element {
  const theme = useTheme();
  const { metrics, timeFrame, handleClick } = props;
  const [weekData, setWeekData] = useState<inputData>();
  const [monthData, setMonthData] = useState<inputData>();
  const [yearData, setYearDara] = useState<inputData>();

  useEffect(() => {
    let yearCount: dates = defaultData;
    let monthCount = {};
    let weekCount = {};

    metrics?.forEach((fp) => {
      if (fp[0]) {
        const date = new Date(fp[0]);
        const now = Date.now();
        const sevenDays = 604800000;
        const thirtyDays = 2592000000;
        const oneYear = 31536000000;
        const difference = now - date.getTime();

        if (difference <= oneYear) {
          const month: date = datesArray[date.getMonth()];
          console.log(month);
          console.log(fp[1]);
          console.log(yearCount);
          if (fp[1] === 'PENDING') yearCount[month]['PENDING'] += 1;
          else if (fp[1] === 'APPROVED') yearCount[month]['APPROVED'] += 1;
          // else if (fp[1] === 'DENIED') yearCount[month]['DENIED'] += 1;
        }
        if (difference <= thirtyDays) {
        }
        if (difference <= sevenDays) {
        }
      }
    });
    console.log(yearCount);
  }, [metrics]);

  return (
    <GraphCard
      title={`False Positives - ${timeFrame} Day`}
      handleClick={handleClick}
    >
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 15,
            left: 24,
          }}
        >
          <XAxis
            dataKey="time"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          >
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: 'middle',
                fill: theme.palette.text.primary,
                ...theme.typography.body1,
              }}
            >
              # False Positives
            </Label>
          </YAxis>
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </GraphCard>
  );
}
