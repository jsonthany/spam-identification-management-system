import * as React from 'react';

import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';

export default function Sliders() : JSX.Element {
  const array = Array.from(Array(200).keys());
  return (
    <Grid container spacing={2}>
      {array.map(() => (
        <Grid item xs={3}>
          <Slider
            defaultValue={50}
            aria-label="Default"
            valueLabelDisplay="auto"
          />
        </Grid>
      ))}
    </Grid>
  );
}
