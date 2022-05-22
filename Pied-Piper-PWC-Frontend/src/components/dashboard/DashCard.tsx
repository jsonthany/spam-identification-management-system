// import React, { useState } from 'react';
import React, { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// import CardMedia from "@mui/material/CardMedia";
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Grid from '@mui/material/Grid';

type DashCardProps = {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  link?: string;
};

function DashCard(props: PropsWithChildren<DashCardProps>): JSX.Element {
  const {
    title, subtitle, link, children,
  } = props;
  const navigate = useNavigate();

  return (
    <Card sx={{ width: 400, height: 240 }}>
      {link ? (
        <CardActionArea
          onClick={() => navigate(link)}
          sx={{ width: 400, height: 240 }}
        >
          <CardContent sx={{}}>
            <Grid container spacing={2} rowSpacing={2.5}>
              <Grid item xs={12}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  align="center"
                  fontWeight="bold"
                >
                  {title}
                </Typography>
                <Typography
                  gutterBottom
                  variant="caption"
                  component="div"
                  align="center"
                  fontWeight="bold"
                >
                  {subtitle}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h1" align="center" fontWeight="bold">
                  {children}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      ) : (
        <CardContent sx={{}}>
          <Grid container spacing={2} rowSpacing={2.5}>
            <Grid item xs={12}>
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                align="center"
                fontWeight="bold"
              >
                {title}
              </Typography>
              <Typography
                gutterBottom
                variant="caption"
                component="div"
                align="center"
                fontWeight="bold"
              >
                {subtitle}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h1" align="center" fontWeight="bold">
                {children}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      )}
    </Card>
  );
}

DashCard.defaultProps = {
  title: '',
  subtitle: '',
  link: '',
};

export default DashCard;
