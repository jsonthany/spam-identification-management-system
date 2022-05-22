import React from 'react';
import useTheme from '@mui/material/styles/useTheme';
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
} from 'recharts';
import GraphCard from './GraphCard';
import { Counts } from '../../utilities/interfaces/Counts';

type BucketCountsProps = {
  counts: Counts;
  timeFrame: number;
  handleClick?: (event: React.MouseEvent) => void;
};
export default function PieBuckets(props: BucketCountsProps): JSX.Element {
  const theme = useTheme();
  const { counts, timeFrame, handleClick } = props;
  const { safe, suspect, quarantine } = counts;
  const bucketData = [
    { name: 'Safe', value: safe, color: theme.palette.success.main },
    { name: 'Suspect', value: suspect, color: theme.palette.warning.light },
    {
      name: 'Quarantine',
      value: quarantine,
      color: theme.palette.error.main,
    },
  ];

  return (
    <GraphCard
      title={`Email Categorization - ${timeFrame} Day`}
      handleClick={handleClick}
    >
      <ResponsiveContainer width="100%">
        <PieChart width={400} height={400}>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={bucketData}
            cx="50%"
            cy="45%"
            outerRadius={80}
            fill={theme.palette.primary.main}
          >
            {bucketData.map((value) => (
              <Cell key={`cell-${value.name}`} fill={value.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </GraphCard>
  );
}

PieBuckets.defaultProps = {
  handleClick: null,
};
