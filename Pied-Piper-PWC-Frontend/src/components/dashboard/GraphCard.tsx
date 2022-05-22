import React, { PropsWithChildren } from 'react';
import Card from '@mui/material/Card';
import { CardActionArea } from '@mui/material';
import GraphCardContent from './GraphCardContent';

type GraphCardProps = {
  title: string;
  handleClick?: (event: React.MouseEvent) => void;
};
export default function GraphCard(props: PropsWithChildren<GraphCardProps>): JSX.Element {
  const { title, handleClick, children } = props;

  return (
    <Card sx={{ width: 400, height: 240 }}>
      {handleClick ? (
        <CardActionArea
          onClick={handleClick}
          sx={{ width: 400, height: 240 }}
        >
          <GraphCardContent title={title}>
            {children}
          </GraphCardContent>
        </CardActionArea>
      ) : (
        <GraphCardContent title={title}>
          {children}
        </GraphCardContent>
      )}
    </Card>
  );
}

GraphCard.defaultProps = {
  handleClick: null,
};
