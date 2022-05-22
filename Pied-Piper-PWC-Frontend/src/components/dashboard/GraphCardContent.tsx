import React, { PropsWithChildren } from 'react';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type GraphCardContentProps = {
  title: string;
}
export default function GraphCardContent(
  props: PropsWithChildren<GraphCardContentProps>,
): JSX.Element {
  const { title, children } = props;

  return (
    <CardContent>
      <Paper sx={{ height: 210 }}>
        <Typography
          align="center"
          fontWeight="bold"
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          align="center"
          fontWeight="bold"
        >
          {children}
        </Typography>
      </Paper>
    </CardContent>
  );
}
