import React from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { Delete } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { XListEmail } from '../../utilities/interfaces/XListEmail';
import HelpTooltipText from '../misc/HelpTooltipText';

type XEmailControlsElementProps = {
  emailData: XListEmail;
  handleEmailDelete: (event: React.MouseEvent) => void;
}
export default function XEmailControlsElement(props: XEmailControlsElementProps): JSX.Element {
  const { emailData, handleEmailDelete } = props;

  return (
    <Grid
      container
      item
      direction="row"
      spacing={{ xs: 2, md: 3 }}
      columns={{ xs: 4, sm: 8, md: 12 }}
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={3} sm={6.5} md={10}>
        <Typography
          variant="body2"
        >
          {emailData.email}
        </Typography>
      </Grid>
      <Grid
        item
        xs={0.5}
        justifyContent="center"
      >
        <Tooltip
          title={<HelpTooltipText firstLine="Click this to remove this email from the list." />}
          placement="left"
        >
          <IconButton onClick={handleEmailDelete}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
