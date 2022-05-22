import React from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import GraphCard from './GraphCard';
import { timeFrameInterface } from '../../services/metricsService';

type BucketCountsProps = {
  metrics: timeFrameInterface;
  timeFrame: number;
  handleClick?: (event: React.MouseEvent) => void;
};

type timeFrameString = keyof timeFrameInterface;

export default function BarBuckets(props: BucketCountsProps): JSX.Element {
  const theme = useTheme();
  const { metrics, timeFrame, handleClick } = props;

  let timeFrameKey: timeFrameString = 'oneDay';
  if (timeFrame === 30) timeFrameKey = 'oneMonth';
  if (timeFrame === 7) timeFrameKey = 'oneWeek';

  const bucketData = [
    {
      name: 'Safe',
      uv: metrics[timeFrameKey].SAFE,
      color: theme.palette.success.main,
    },
    {
      name: 'Suspect',
      uv: metrics[timeFrameKey].SUSPECT,
      color: theme.palette.warning.light,
    },
    {
      name: 'Quarant.',
      uv: metrics[timeFrameKey].QUARANTINE,
      color: theme.palette.error.main,
    },
  ];

  return (
    <GraphCard
      title={`Average Risk Scores - ${timeFrame} Day`}
      handleClick={handleClick}
    >
      <ResponsiveContainer width="95%" height={200}>
        <BarChart data={bucketData} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Bar dataKey="uv">
            {bucketData.map((entry) => (
              <Cell cursor="pointer" key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GraphCard>
  );
}

BarBuckets.defaultProps = {
  handleClick: null,
};
